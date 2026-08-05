import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { auth } from "@/server/auth";
import { listActiveAreaTree } from "@/server/services/areas";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { getRequestTenantPath } from "@/server/tenant";

export default async function OnboardingPage(): Promise<ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect(await getRequestTenantPath("/login"));

  const tenantId = session.user.tenantId;
  if (!tenantId) redirect(await getRequestTenantPath("/login"));
  const areas = await listActiveAreaTree(tenantId);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-6 py-12">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight">What should we read to you?</h1>
        <p className="text-muted-foreground">
          Choose at least one area. You can keep it broad or choose more specific topics,
          and you can change this later.
        </p>
      </div>
      <div className="mt-8">
        <OnboardingForm areas={areas} />
      </div>
    </main>
  );
}
