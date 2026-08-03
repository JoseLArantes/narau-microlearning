import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@dailycurio/database";
import { getEmailFrom } from "@dailycurio/email";
import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import EmailProvider from "next-auth/providers/email";

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

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      server: smtpSettings(),
      from: getEmailFrom(),
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
          select: { role: true, status: true },
        });
        token.id = user.id;
        token.role = dbUser?.role ?? "USER";
        const areaCount = await prisma.userArea.count({ where: { userId: user.id } });
        token.hasAreas = areaCount > 0;
      }
      if (trigger === "update" && session && "hasAreas" in session && typeof session.hasAreas === "boolean") {
        token.hasAreas = session.hasAreas;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "USER";
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
