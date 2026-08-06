import type { ReactElement } from "react";
import { requireAdmin } from "@/server/guards";
import { getAppSettings } from "@/server/services/app-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@narau/ui";
import { ReadingTimeControl } from "@/components/admin/reading-time-control";
import { LlmSettingsControl } from "@/components/admin/llm-settings-control";

export default async function AdminSettingsPage(): Promise<ReactElement> {
  const session = await requireAdmin();
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">The house rules every card is sized to.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Card length</CardTitle>
          <CardDescription>
            Each daily card is trimmed to roughly this many minutes of reading (about 200 words per
            minute). Existing cards keep their content; new assignments are sized to the new
            default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReadingTimeControl current={settings.defaultReadingMinutes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Source-bound AI curation</CardTitle>
          <CardDescription>
            Connect OpenAI, DeepSeek, or Gemini to shape each shared daily publication to the
            configured reading time. Narau uses the correct structured-output mode for each
            provider; Wikipedia remains the source of truth and automatic fallback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session.user.role === "ADMIN" ? (
            <LlmSettingsControl current={settings.llm} />
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              AI connection credentials are managed by a global administrator. Current status:{" "}
              {settings.llm.enabled ? "on" : "off"}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
