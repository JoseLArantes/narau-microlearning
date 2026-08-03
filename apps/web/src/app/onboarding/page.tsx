import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { auth } from "@/server/auth";
import { listActiveAreas } from "@/server/services/areas";
import { OnboardingForm } from "@/components/forms/onboarding-form";

export default async function OnboardingPage(): Promise<ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const areas = await listActiveAreas();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-6 py-12">
      <div className="space-y-2">
        <p className="font-serif text-lg tracking-tight">Daily Curio</p>
        <h1 className="font-serif text-3xl tracking-tight">What should we read to you?</h1>
        <p className="text-muted-foreground">
          Choose at least one area. You&apos;ll get one item from a randomly selected
          area every day, and you can change this later.
        </p>
      </div>
      <div className="mt-8">
        <OnboardingForm areas={areas} />
      </div>
    </main>
  );
}
