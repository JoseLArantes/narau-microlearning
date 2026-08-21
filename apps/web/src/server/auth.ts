import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@narau/database";
import { getEmailFrom, renderMagicLinkEmail, sendEmail } from "@narau/email";
import type { Adapter, AdapterUser } from "@auth/core/adapters";
import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Twitter from "next-auth/providers/twitter";
import LinkedIn from "next-auth/providers/linkedin";
import { resolveUserIdFromToken } from "./session";
import { getRequestTenant } from "./tenant";
import { attachTenantToAdapterUser } from "./tenant-auth";

function getEffectiveBaseUrl(fallback?: string): string {
  const envUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  const raw = envUrl || fallback || "http://localhost:3030";
  return raw.replace(/\/+$/, "");
}

export function sanitizeAppUrl(rawUrl: string, fallbackBaseUrl?: string): string {
  const effectiveBase = getEffectiveBaseUrl(fallbackBaseUrl);
  try {
    if (rawUrl.startsWith("/")) {
      return `${effectiveBase}${rawUrl}`;
    }
    const base = new URL(effectiveBase);
    const parsed = new URL(rawUrl);
    if (
      parsed.origin === base.origin ||
      parsed.hostname === "0.0.0.0" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "localhost"
    ) {
      parsed.protocol = base.protocol;
      parsed.host = base.host;
      parsed.port = base.port;
    }

    const callbackUrlParam = parsed.searchParams.get("callbackUrl");
    if (callbackUrlParam) {
      if (callbackUrlParam.startsWith("/")) {
        parsed.searchParams.set("callbackUrl", `${effectiveBase}${callbackUrlParam}`);
      } else {
        try {
          const parsedCallback = new URL(callbackUrlParam);
          if (
            parsedCallback.origin === base.origin ||
            parsedCallback.hostname === "0.0.0.0" ||
            parsedCallback.hostname === "127.0.0.1" ||
            parsedCallback.hostname === "localhost"
          ) {
            parsedCallback.protocol = base.protocol;
            parsedCallback.host = base.host;
            parsedCallback.port = base.port;
            parsed.searchParams.set("callbackUrl", parsedCallback.toString());
          }
        } catch {
          // Keep callbackUrl unchanged if not a valid URL
        }
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function smtpSettings(): { host: string; port: number; auth?: { user: string; pass: string } } {
  return {
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  };
}

const tenantAwareAdapter: Adapter = {
  ...PrismaAdapter(prisma),
  async createUser(user: AdapterUser): Promise<AdapterUser> {
    const tenant = await getRequestTenant();
    return prisma.user.create({ data: attachTenantToAdapterUser(user, tenant.id) });
  },
};

export const authConfig: NextAuthConfig = {
  adapter: tenantAwareAdapter,
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      server: smtpSettings(),
      from: getEmailFrom(),
      async sendVerificationRequest({ identifier, url }) {
        const magicLinkUrl = sanitizeAppUrl(url);
        const html = renderMagicLinkEmail({ email: identifier, url: magicLinkUrl });
        await sendEmail({
          to: identifier,
          subject: "Sign In to Narau",
          html,
        });
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "dummy-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "dummy-google-secret",
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "dummy-facebook-id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "dummy-facebook-secret",
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID ?? "dummy-twitter-id",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "dummy-twitter-secret",
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? "dummy-linkedin-id",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "dummy-linkedin-secret",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return sanitizeAppUrl(url, baseUrl);
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, status: true, tenantId: true },
        });
        token.id = user.id;
        token.role = dbUser?.role ?? "USER";
        token.tenantId = dbUser?.tenantId;
        const areaCount = await prisma.userArea.count({ where: { userId: user.id } });
        token.hasAreas = areaCount > 0;
      }
      if (trigger === "update" && session) {
        if ("hasAreas" in session && typeof session.hasAreas === "boolean") {
          token.hasAreas = session.hasAreas;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = resolveUserIdFromToken(token);
        if (userId) {
          session.user.id = userId;
        }
        session.user.role = token.role ?? "USER";
        session.user.tenantId = token.tenantId;
        session.hasAreas = Boolean(token.hasAreas);
      }
      return session;
    },
  },
  trustHost: true,
};

const authResult = NextAuth(authConfig);

export const { handlers, signIn, signOut } = authResult;
export const auth: () => Promise<Session | null> = authResult.auth;
