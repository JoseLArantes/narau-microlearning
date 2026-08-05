import { Courier_Prime, Literata } from "next/font/google";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Providers } from "@/components/providers";
import { getRequestTenant, listTenants } from "@/server/tenant";
import "./globals.css";

const literata = Literata({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Narau",
    template: "%s · Narau",
  },
  description: "One small, well-sourced thing to learn every day.",
  icons: {
    icon: "/narau_icon.png",
    shortcut: "/narau_icon.png",
    apple: "/narau_icon.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  const [initialTenant, tenants] = await Promise.all([getRequestTenant(), listTenants()]);
  return (
    <html lang="en" className={`${literata.variable} ${courierPrime.variable}`}>
      <body className="min-h-dvh font-sans">
        {/*
THESIS: The daily item is one card in a drawer; Narau is a quiet personal library where a curator files one well-sourced card each morning, refusing both the feed and the cream-editorial default.
OWN-WORLD: Manila index cards on an ivory desk; typewriter mono metadata; Literata reading; ink imprints for actions; rubber-stamp red reserved for the LEARNED moment and urgent flags; hairline rules and guide tabs instead of rounded pill chrome.
STORY: A learner pulls today's card, reads a well-sourced gem, stamps it learned, and watches the card join the drawer of learned entries on their dashboard.
FIRST VIEWPORT: One large manila card on the desk, a guide tab at its top edge naming the area, a typewriter metadata line, the title in Literata, the reading below, a SEE-ALSO source footer, and a rubber-stamp LEARNED control at the close.
FORM: Library card catalog, candidate 4 of the grounded list, seed 27783a62.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and docs/DESIGN.md
*/}
        <Providers initialTenant={initialTenant} tenants={tenants}>{children}</Providers>
      </body>
    </html>
  );
}
