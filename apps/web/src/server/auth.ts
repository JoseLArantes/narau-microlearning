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
        const html = renderMagicLinkEmail({ email: identifier, url });
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
