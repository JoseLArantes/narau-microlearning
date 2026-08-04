import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";

export function Logo({ className = "w-[80%] max-w-[160px] h-auto" }: { className?: string }): ReactElement {
  return (
    <Link href="/today" className="inline-flex items-center gap-2 max-w-full">
      <img src="/narau_logo.svg" alt="Narau" className={`object-contain ${className}`} />
    </Link>
  );
}
