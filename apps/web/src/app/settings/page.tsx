import type { ReactElement } from "react";
import { requireUser } from "@/server/guards";
import { listActiveAreas } from "@/server/services/areas";
import { getUserAreas } from "@/server/repositories/user-areas";
import { AppHeader } from "@/components/layout/app-header";
import { AreasForm } from "@/components/forms/areas-form";
import { Card, CardContent, CardHeader, CardTitle } from "@narau/ui";

export default async function SettingsPage(): Promise<ReactElement> {
  const session = await requireUser();
  const tenantId = session.user.tenantId;
  if (!tenantId) throw new Error("User tenant is missing.");
  const areas = await listActiveAreas(tenantId);
  const userAreas = await getUserAreas(session.user.id, tenantId);

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl space-y-8 px-6 py-12">
        <header className="space-y-2">
          <span className="mono-meta text-muted-foreground">THE LENDING DESK</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Your account and what you want to read about.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{session.user.email}</p>
            <p className="text-muted-foreground">Signed in with a magic link.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Areas of interest</CardTitle>
          </CardHeader>
          <CardContent>
            <AreasForm
              areas={areas}
              currentAreaIds={userAreas.map((userArea) => userArea.areaId)}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
