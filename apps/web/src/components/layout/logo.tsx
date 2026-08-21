"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useI18n } from "../i18n-context";
import { tenantPath } from "@/server/tenant-routing";

export function Logo({ className = "w-[60%] max-w-[160px] h-auto" }: { className?: string }): ReactElement {
  const { tenant } = useI18n();
  return (
    <Link href={tenantPath(tenant.slug, "/today")} className="inline-flex items-center gap-2 max-w-full">
      <img src="/narau_logo.png" alt="Narau" className={`object-contain ${className}`} />
    </Link>
  );
}
