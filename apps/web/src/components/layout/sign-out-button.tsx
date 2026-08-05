"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@narau/ui";
import { useI18n } from "../i18n-context";
import { tenantPath } from "@/server/tenant-routing";

export function SignOutButton(): React.ReactElement {
  const { tenant } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void signOut({ callbackUrl: tenantPath(tenant.slug, "/") })}
    >
      <LogOut /> Sign out
    </Button>
  );
}
