"use client";

import * as React from "react";
import { updateUserLearningInterests } from "@/server/actions/settings";
import { LearningInterestSelector, type AreaTreeOption } from "./learning-interest-selector";

export function AreasForm({
  areas,
  currentAreaIds,
}: {
  areas: AreaTreeOption[];
  currentAreaIds: string[];
}): React.ReactElement {
  return (
    <LearningInterestSelector
      areas={areas}
      initialSelectedNodeIds={currentAreaIds}
      onSave={updateUserLearningInterests}
      submitLabel="Save learning choices"
      successMessage="Your choices will guide tomorrow’s card."
    />
  );
}
