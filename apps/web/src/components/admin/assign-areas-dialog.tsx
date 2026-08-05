"use client";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@narau/ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { adminAssignLearningInterests } from "@/server/actions/admin/users";
import { LearningInterestSelector, type AreaTreeOption } from "@/components/forms/learning-interest-selector";
import type { UserRow } from "./users-table";

export function AssignAreasDialog({ user, areas }: { user: UserRow; areas: AreaTreeOption[] }): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Interests</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Learning interests for {user.email}</DialogTitle>
          <DialogDescription>Specific choices replace a broader area and apply to the next card.</DialogDescription>
        </DialogHeader>
        <LearningInterestSelector
          areas={areas}
          initialSelectedNodeIds={user.userAreas.map((entry) => entry.areaId)}
          onSave={async (selectedNodeIds) => {
            const response = await adminAssignLearningInterests({ userId: user.id, selectedNodeIds });
            if (response.ok) {
              setOpen(false);
              router.refresh();
            }
            return response;
          }}
          submitLabel="Save interests"
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
