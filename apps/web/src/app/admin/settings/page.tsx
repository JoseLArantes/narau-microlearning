import type { ReactElement } from "react";
import { requireAdmin } from "@/server/guards";
import { getAppSettings } from "@/server/services/app-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@narau/ui";
import { ReadingTimeControl } from "@/components/admin/reading-time-control";

export default async function AdminSettingsPage(): Promise<ReactElement> {
  await requireAdmin();
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <span className="mono-meta text-muted-foreground">READING ROOM RULES</span>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">The house rules every card is sized to.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Card length</CardTitle>
          <CardDescription>
            Each daily card is trimmed to roughly this many minutes of reading
            (about 200 words per minute). Existing cards keep their content; new
            assignments are sized to the new default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReadingTimeControl current={settings.defaultReadingMinutes} />
        </CardContent>
      </Card>
    </div>
  );
}
