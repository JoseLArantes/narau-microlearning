import { renderEmailLayout } from "./layout";

export interface WelcomeEmailOptions {
  userName?: string;
  actionUrl?: string;
}

export function renderWelcomeEmail(options: WelcomeEmailOptions): string {
  const { userName, actionUrl = "http://localhost:3030/onboarding" } = options;
  const displayName = userName ?? "Learner";

  const contentHtml = `
    <!-- Header Tag -->
    <div style="margin-bottom: 16px;">
      <span style="font-family:'Courier New', Courier, monospace; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#16A34A; border:1px solid #16A34A; border-radius:2px; padding:2px 6px;">
        WELCOME TO NARAU
      </span>
    </div>

    <!-- Title -->
    <h1 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.25; color: #1F1A14;">
      Welcome to Narau, ${displayName}.
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #34220A;">
      Narau is your quiet daily library. No social feed, no endless scrolling, no manufactured engagement — just <strong>one small, well-sourced card to learn every morning</strong>.
    </p>

    <div style="margin: 24px 0; background-color:#FAF8F3; border:1px solid #D3CBBB; border-radius:6px; padding:20px;">
      <h2 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1F1A14;">
        How the daily ritual works:
      </h2>
      <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #34220A;">
        <li><strong>Choose your areas:</strong> Select subjects like History, Science, Art, or Space.</li>
        <li><strong>Receive one card a day:</strong> Pulled directly from curated Wikipedia articles.</li>
        <li><strong>Stamp it learned:</strong> Build your personal archive of real knowledge.</li>
      </ol>
    </div>

    <!-- Action Button -->
    <div style="margin: 32px 0 24px 0; text-align: center;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #1F1A14; color: #F9F7F0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; text-decoration: none; padding: 14px 28px; border-radius: 4px; border: 1px solid #1F1A14; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
        SET UP YOUR AREAS &rarr;
      </a>
    </div>

    <!-- Cool Message -->
    <p style="margin: 24px 0 0 0; text-align: center; font-style: italic; font-size: 13px; color: #6D6255; border-top: 1px dashed #D3CBBB; padding-top: 16px;">
      "Knowledge is built one card at a time."
    </p>
  `;

  return renderEmailLayout({
    title: "Welcome to Narau",
    previewText: "Your quiet personal library where one well-sourced card arrives every morning.",
    headerMeta: "WELCOME · DAILY RITUAL",
    contentHtml,
  });
}
