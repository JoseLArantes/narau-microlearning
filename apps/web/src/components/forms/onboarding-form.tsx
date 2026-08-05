"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { selectOnboardingInterests } from "@/server/actions/onboarding";
import { useI18n } from "@/components/i18n-context";
import { tenantPath } from "@/server/tenant-routing";
import { LearningInterestSelector, type AreaTreeOption } from "./learning-interest-selector";

export function OnboardingForm({ areas }: { areas: AreaTreeOption[] }): React.ReactElement {
  const router = useRouter();
  const { tenant, t } = useI18n();
  const { update } = useSession();

  async function save(selectedNodeIds: string[]) {
    const result = await selectOnboardingInterests(selectedNodeIds);
    if (result.ok) {
      await update({ hasAreas: true });
      router.push(tenantPath(tenant.slug, "/today"));
      router.refresh();
    }
    return result;
  }

  return (
    <LearningInterestSelector
      areas={areas}
      onSave={save}
      submitLabel={t("onboarding.save", undefined, "Start learning")}
    />
  );
}
