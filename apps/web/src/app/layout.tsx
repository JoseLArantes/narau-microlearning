import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Daily Curio",
    template: "%s · Daily Curio",
  },
  description: "One small, well-sourced thing to learn every day.",
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
