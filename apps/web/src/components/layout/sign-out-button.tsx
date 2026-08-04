"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@narau/ui";

export function SignOutButton(): React.ReactElement {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void signOut({ callbackUrl: "/" })}
    >
      <LogOut /> Sign out
    </Button>
  );
}
