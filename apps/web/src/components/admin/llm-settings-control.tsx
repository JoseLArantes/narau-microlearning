"use client";

import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@narau/ui";
import * as React from "react";
import { useRouter } from "next/navigation";
import { adminSaveLlmSettings, adminTestLlmSettings } from "@/server/actions/admin/settings";
import type { LlmProviderInput } from "@narau/validation";

const PROVIDERS: Record<
  LlmProviderInput,
  { label: string; endpoint: string; modelPlaceholder: string; responseMode: string }
> = {
  OPENAI: {
    label: "OpenAI",
    endpoint: "https://api.openai.com/v1",
    modelPlaceholder: "gpt-5.6",
    responseMode: "Strict JSON Schema",
  },
  DEEPSEEK: {
    label: "DeepSeek",
    endpoint: "https://api.deepseek.com",
    modelPlaceholder: "deepseek-v4-pro",
    responseMode: "JSON mode with Narau validation",
  },
  GEMINI: {
    label: "Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai",
    modelPlaceholder: "gemini-3.6-flash",
    responseMode: "Strict JSON Schema",
  },
};

export interface LlmSettingsControlProps {
  current: {
    enabled: boolean;
    provider: LlmProviderInput;
    model: string;
    hasApiKey: boolean;
    apiKeyHint: string | null;
  };
}

export function LlmSettingsControl({ current }: LlmSettingsControlProps): React.ReactElement {
  const router = useRouter();
  const [enabled, setEnabled] = React.useState(current.enabled);
  const [provider, setProvider] = React.useState<LlmProviderInput>(current.provider);
  const [model, setModel] = React.useState(current.model);
  const [apiKey, setApiKey] = React.useState("");
  const [pendingAction, setPendingAction] = React.useState<"save" | "test" | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]> | null>(null);

  const input = { enabled, provider, model, apiKey };
  const providerChanged = provider !== current.provider;
  const hasUsableApiKey = Boolean(apiKey.trim()) || (!providerChanged && current.hasApiKey);
  const isDirty =
    enabled !== current.enabled || providerChanged || model !== current.model || apiKey.length > 0;

  function changeProvider(value: LlmProviderInput): void {
    setProvider(value);
    if (value !== provider) {
      setModel("");
      setApiKey("");
      setMessage(null);
      setError(null);
      setFieldErrors(null);
    }
  }

  async function run(action: "save" | "test"): Promise<void> {
    setPendingAction(action);
    setMessage(null);
    setError(null);
    setFieldErrors(null);
    const result =
      action === "save" ? await adminSaveLlmSettings(input) : await adminTestLlmSettings(input);
    setPendingAction(null);
    if (!result.ok) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? null);
      return;
    }
    if (action === "save") {
      setApiKey("");
      setMessage(
        enabled ? "Saved. New daily selections will be curated." : "Saved. AI curation is off.",
      );
      router.refresh();
      return;
    }
    setMessage("Connection verified. The model returned the expected structured response.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">AI curation</span>
            <Badge variant={enabled ? "secondary" : "muted"}>{enabled ? "ON" : "OFF"}</Badge>
          </div>
          <p className="max-w-[68ch] text-sm leading-6 text-muted-foreground">
            When on, the selected Wikipedia text is rewritten to the card reading time. If the model
            fails, readers still receive the original Wikipedia text.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Enable AI curation"
          onClick={() => setEnabled((value) => !value)}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            enabled ? "border-primary bg-primary" : "border-border bg-muted",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-1 h-[18px] w-[18px] rounded-full bg-background shadow-sm transition-transform",
              enabled ? "translate-x-[25px]" : "translate-x-1",
            )}
          />
        </button>
      </div>

      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="llm-provider">Provider</Label>
          <Select
            value={provider}
            onValueChange={(value) => changeProvider(value as LlmProviderInput)}
          >
            <SelectTrigger id="llm-provider" aria-describedby="llm-provider-detail">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROVIDERS) as LlmProviderInput[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {PROVIDERS[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="llm-model">Model ID</Label>
          <Input
            id="llm-model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder={PROVIDERS[provider].modelPlaceholder}
            aria-invalid={Boolean(fieldErrors?.model)}
          />
          {fieldErrors?.model?.[0] ? (
            <p className="text-sm text-destructive">{fieldErrors.model[0]}</p>
          ) : null}
        </div>

        <div
          id="llm-provider-detail"
          className="min-w-0 rounded-[var(--radius)] border border-border bg-muted/40 px-4 py-3 sm:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              {PROVIDERS[provider].label} endpoint
            </span>
            <Badge variant="muted">{PROVIDERS[provider].responseMode}</Badge>
          </div>
          <code className="mt-1 block break-all text-xs leading-5 text-muted-foreground">
            {PROVIDERS[provider].endpoint}
          </code>
        </div>

        <div className="min-w-0 space-y-2 sm:col-span-2">
          <Label htmlFor="llm-api-key">API key</Label>
          <Input
            id="llm-api-key"
            type="password"
            autoComplete="new-password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={
              !providerChanged && current.hasApiKey
                ? "Leave blank to keep stored key"
                : `Enter API key for ${PROVIDERS[provider].label}`
            }
          />
          <p className="text-xs leading-5 text-muted-foreground">
            {!providerChanged && current.hasApiKey
              ? `Encrypted key stored${current.apiKeyHint ? ` (${current.apiKeyHint})` : ""}. Enter a new one only to replace it.`
              : providerChanged
                ? `Provider changed. Enter an API key for ${PROVIDERS[provider].label}; credentials are never reused across providers.`
                : "The key is encrypted before it is stored and is never shown again."}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius)] bg-muted/50 px-4 py-3 text-sm leading-6 text-muted-foreground">
        The model receives the canonical URL, title, language, and Wikipedia source text. It is
        instructed to add no outside facts, names, dates, numbers, or interpretation; unsupported
        output is rejected.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => void run("save")}
          disabled={
            pendingAction !== null || !isDirty || (enabled && (!model.trim() || !hasUsableApiKey))
          }
        >
          {pendingAction === "save" ? "Saving…" : "Save AI settings"}
        </Button>
        <Button
          variant="outline"
          onClick={() => void run("test")}
          disabled={pendingAction !== null || !model.trim() || !hasUsableApiKey}
        >
          {pendingAction === "test" ? "Testing…" : "Test connection"}
        </Button>
      </div>

      <div aria-live="polite" className="min-h-5">
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
