import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "./auth";

export type AuthenticatedSession = Session & { user: { id: string; role: "ADMIN" | "MODERATOR" | "USER" } };

export async function requireUser(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session as AuthenticatedSession;
}

export async function requireAdmin(): Promise<AuthenticatedSession> {
  const session = await requireUser();
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    redirect("/dashboard");
  }
  return session;
}
