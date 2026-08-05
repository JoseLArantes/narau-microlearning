import { renderEmailLayout } from "./layout";

export interface MagicLinkEmailOptions {
  email: string;
  url: string;
  host?: string;
}

export function renderMagicLinkEmail(options: MagicLinkEmailOptions): string {
  const { email, url } = options;

  const contentHtml = `
    <!-- Header Tag -->
    <div style="margin-bottom: 16px;">
      <span style="font-family:'Courier New', Courier, monospace; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#16A34A; border:1px solid #16A34A; border-radius:2px; padding:2px 6px;">
        SMART LINK DELIVERY
      </span>
    </div>

    <!-- Title -->
    <h1 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.25; color: #1F1A14;">
      Sign In to Narau
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #34220A;">
      We received a request to sign in to Narau for <strong>${email}</strong>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #6D6255;">
      Click the button below to sign in instantly to your personal library. No password required.
    </p>

    <!-- Action Button -->
    <div style="margin: 32px 0 24px 0; text-align: center;">
      <a href="${url}" style="display: inline-block; background-color: #1F1A14; color: #F9F7F0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; text-decoration: none; padding: 14px 28px; border-radius: 4px; border: 1px solid #1F1A14; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
        SIGN IN TO NARAU &rarr;
      </a>
    </div>

    <!-- Fallback Box -->
    <div style="margin-top: 28px; background-color:#FAF8F3; border:1px solid #D3CBBB; border-radius:4px; padding:12px 16px; font-family:'Courier New', Courier, monospace; font-size:11px; word-break:break-all; color:#6D6255;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #1F1A14;">HAVING TROUBLE WITH THE BUTTON?</p>
      <a href="${url}" style="color:#16A34A; text-decoration:none;">${url}</a>
    </div>

    <p style="margin: 24px 0 0 0; text-align: center; font-style: italic; font-size: 13px; color: #6D6255; border-top: 1px dashed #D3CBBB; padding-top: 16px;">
      If you did not request this email, you can safely ignore it.
    </p>
  `;

  return renderEmailLayout({
    title: "Sign In to Narau",
    previewText: `Sign in to Narau as ${email}.`,
    headerMeta: "AUTHENTICATION · MAGIC LINK",
    contentHtml,
  });
}
