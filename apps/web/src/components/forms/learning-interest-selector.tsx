"use client";

import { Button, Label } from "@narau/ui";
import { learningInterestSelectionSchema } from "@narau/validation";
import * as React from "react";
import { useTransition } from "react";
import { useI18n } from "@/components/i18n-context";

export interface AreaTreeOption {
  id: string;
  parentId: string | null;
  level: "AREA" | "TOPIC" | "SPECIALTY";
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  effectiveActive: boolean;
  children: AreaTreeOption[];
}

interface ActionResultLike {
  ok: boolean;
  error?: string;
}

interface LearningInterestSelectorProps {
  areas: AreaTreeOption[];
  initialSelectedNodeIds?: string[];
  onSave: (selectedNodeIds: string[]) => Promise<ActionResultLike>;
  submitLabel?: string;
  successMessage?: string;
}

export function LearningInterestSelector({
  areas,
  initialSelectedNodeIds = [],
  onSave,
  submitLabel,
  successMessage,
}: LearningInterestSelectorProps): React.ReactElement {
  const { t } = useI18n();
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(initialSelectedNodeIds));
  const [refined, setRefined] = React.useState<Set<string>>(() => {
    const initial = new Set(initialSelectedNodeIds);
    const result = new Set<string>();
    for (const area of areas) {
      if (area.children.some((child) => initial.has(child.id) || child.children.some((grandchild) => initial.has(grandchild.id)))) {
        result.add(area.id);
      }
      for (const topic of area.children) {
        if (topic.children.some((child) => initial.has(child.id))) result.add(topic.id);
      }
    }
    return result;
  });
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function descendants(node: AreaTreeOption): string[] {
    return node.children.flatMap((child) => [child.id, ...descendants(child)]);
  }

  function ancestorIds(node: AreaTreeOption, roots: AreaTreeOption[]): string[] {
    for (const root of roots) {
      if (root.id === node.id) return [];
      for (const topic of root.children) {
        if (topic.id === node.id) return [root.id];
        if (topic.children.some((child) => child.id === node.id)) return [root.id, topic.id];
      }
    }
    return [];
  }

  function toggleNode(node: AreaTreeOption): void {
    setSelected((current) => {
      const next = new Set(current);
      const ancestors = ancestorIds(node, areas);
      if (next.has(node.id)) {
        next.delete(node.id);
        return next;
      }
      next.add(node.id);
      for (const ancestor of ancestors) next.delete(ancestor);
      for (const descendant of descendants(node)) next.delete(descendant);
      return next;
    });
  }

  function chooseBroad(node: AreaTreeOption): void {
    setRefined((current) => {
      const next = new Set(current);
      next.delete(node.id);
      return next;
    });
    setSelected((current) => {
      const next = new Set(current);
      next.add(node.id);
      for (const descendant of descendants(node)) next.delete(descendant);
      return next;
    });
  }

  function chooseSpecific(node: AreaTreeOption): void {
    setRefined((current) => new Set(current).add(node.id));
    setSelected((current) => {
      const next = new Set(current);
      next.delete(node.id);
      return next;
    });
  }

  function submit(): void {
    setError(null);
    setMessage(null);
    const selectedNodeIds = [...selected];
    const parsed = learningInterestSelectionSchema.safeParse({ selectedNodeIds });
    if (!parsed.success) {
      setError(t("onboarding.selectOne", undefined, "Choose at least one area or topic."));
      return;
    }
    startTransition(async () => {
      const result = await onSave(parsed.data.selectedNodeIds);
      if (!result.ok) {
        setError(result.error ?? t("common.error", undefined, "Something went wrong."));
        return;
      }
      setMessage(successMessage ?? t("settings.saved", undefined, "Your learning choices were saved."));
    });
  }

  function renderNode(node: AreaTreeOption, depth = 0): React.ReactNode {
    const isSelected = selected.has(node.id);
    const isRefined = refined.has(node.id);
    const children = node.children.filter((child) => child.effectiveActive);
    const label = node.level === "AREA" ? t("learning.area", undefined, "Area") : node.level === "TOPIC" ? t("learning.topic", undefined, "Topic") : t("learning.specialty", undefined, "Specialty");

    return (
      <div key={node.id} className={depth > 0 ? "ml-4 border-l border-border pl-4 sm:ml-8" : ""}>
        <Label className="flex cursor-pointer items-start gap-3 py-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleNode(node)}
            className="mt-1 size-4 accent-[hsl(var(--primary))]"
            aria-label={`${label}: ${node.name}`}
          />
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-lg tracking-tight">{node.name}</span>
            {node.description ? <span className="block text-sm text-muted-foreground">{node.description}</span> : null}
          </span>
        </Label>

        {children.length > 0 && (isSelected || isRefined) ? (
          <div className="mb-3 ml-7 border-t border-border/70 pt-3">
            <p className="mono-meta text-muted-foreground">
              {t("learning.refineQuestion", { name: node.name }, `Do you want to learn more specific topics under ${node.name}?`)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant={!isRefined ? "default" : "outline"} onClick={() => chooseBroad(node)}>
                {t("learning.keepBroad", undefined, `Keep ${node.name} broad`)}
              </Button>
              <Button type="button" size="sm" variant={isRefined ? "default" : "outline"} onClick={() => chooseSpecific(node)}>
                {t("learning.chooseSpecific", undefined, "Choose specific topics")}
              </Button>
            </div>
            {isRefined ? <div className="mt-3 space-y-1">{children.map((child) => renderNode(child, depth + 1))}</div> : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t("learning.specificityHint", undefined, "You can keep an area broad or choose more specific topics. Specific choices replace the broader area.")}
        </p>
        <p className="mono-meta text-muted-foreground">{selected.size} {t("learning.selected", undefined, "selected")}</p>
      </div>
      <div className="space-y-3">
        {areas.map((area) => (
          <section key={area.id} className="index-card px-4 py-3 sm:px-5">
            {renderNode(area)}
          </section>
        ))}
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="button" size="lg" onClick={submit} disabled={pending || selected.size === 0}>
        {pending ? t("common.loading", undefined, "Saving…") : submitLabel ?? t("system.startLearning", undefined, "Start learning")}
      </Button>
    </div>
  );
}
