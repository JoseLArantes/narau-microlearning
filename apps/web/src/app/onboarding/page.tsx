import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { auth } from "@/server/auth";
import { listActiveAreas } from "@/server/services/areas";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { getRequestTenantPath } from "@/server/tenant";

export default async function OnboardingPage(): Promise<ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect(await getRequestTenantPath("/login"));

  const tenantId = session.user.tenantId;
  if (!tenantId) redirect(await getRequestTenantPath("/login"));
  const areas = await listActiveAreas(tenantId);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-6 py-12">
      <div className="space-y-2">
        <span className="mono-meta text-muted-foreground">CHOOSE YOUR TABS</span>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">What should we read to you?</h1>
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
