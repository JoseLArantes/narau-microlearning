"use client";

import { Button, Label } from "@dailycurio/ui";
import { onboardingAreasSchema } from "@dailycurio/validation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { selectOnboardingAreas } from "@/server/actions/onboarding";

interface AreaOption {
  id: string;
  name: string;
  description: string | null;
}

export function OnboardingForm({ areas }: { areas: AreaOption[] }): React.ReactElement {
  const router = useRouter();
  const { update } = useSession();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<{ areaIds: string[] }>();
  const [serverError, setServerError] = React.useState<string | null>(null);

  async function onSubmit(values: { areaIds: string[] }): Promise<void> {
    setServerError(null);
    const parsed = onboardingAreasSchema.safeParse(values);
    if (!parsed.success) {
      setServerError("Choose at least one area.");
      return;
    }
    const result = await selectOnboardingAreas(parsed.data.areaIds);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    await update({ hasAreas: true });
    router.push("/today");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="sr-only">Areas of interest</legend>
        {areas.map((area) => (
          <Label
            key={area.id}
            htmlFor={area.id}
            className="flex cursor-pointer items-start gap-4 rounded-[calc(var(--radius)+2px)] border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/50 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
          >
            <input
              type="checkbox"
              id={area.id}
              value={area.id}
              {...register("areaIds")}
              className="mt-1 size-4 accent-[hsl(var(--primary))]"
            />
            <span className="space-y-0.5">
              <span className="block font-medium">{area.name}</span>
              {area.description ? (
                <span className="block text-sm text-muted-foreground">{area.description}</span>
              ) : null}
            </span>
          </Label>
        ))}
      </fieldset>
      {errors.areaIds || serverError ? (
        <p className="text-sm text-destructive">{errors.areaIds?.message ?? serverError}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Start learning"}
      </Button>
    </form>
  );
}
