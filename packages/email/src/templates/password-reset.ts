import { renderEmailLayout } from "./layout";

export interface PasswordResetEmailOptions {
  email: string;
  resetUrl: string;
  expiresMinutes?: number;
}

export function renderPasswordResetEmail(options: PasswordResetEmailOptions): string {
  const { email, resetUrl, expiresMinutes = 30 } = options;

  const contentHtml = `
    <!-- Header Tag -->
    <div style="margin-bottom: 16px;">
      <span style="font-family:'Courier New', Courier, monospace; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#C2410C; border:1px solid #C2410C; border-radius:2px; padding:2px 6px;">
        SECURITY · PASSWORD RECOVERY
      </span>
    </div>

    <!-- Title -->
    <h1 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.25; color: #1F1A14;">
      Reset Your Password
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #34220A;">
      We received a password reset request for <strong>${email}</strong>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #6D6255;">
      Click the button below to choose a new password. This link is valid for <strong>${expiresMinutes} minutes</strong>.
    </p>

    <!-- Action Button -->
    <div style="margin: 32px 0 24px 0; text-align: center;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #1F1A14; color: #F9F7F0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; text-decoration: none; padding: 14px 28px; border-radius: 4px; border: 1px solid #1F1A14; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
        RESET PASSWORD &rarr;
      </a>
    </div>

    <!-- Fallback URL box -->
    <div style="margin-top: 28px; background-color:#FAF8F3; border:1px solid #D3CBBB; border-radius:4px; padding:12px 16px; font-family:'Courier New', Courier, monospace; font-size:11px; word-break:break-all; color:#6D6255;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #1F1A14;">BUTTON NOT WORKING?</p>
      <a href="${resetUrl}" style="color:#16A34A; text-decoration:none;">${resetUrl}</a>
    </div>

    <p style="margin: 24px 0 0 0; text-align: center; font-style: italic; font-size: 13px; color: #6D6255; border-top: 1px dashed #D3CBBB; padding-top: 16px;">
      If you did not request a password reset, you can safely ignore this message.
    </p>
  `;

  return renderEmailLayout({
    title: "Reset Your Password · Narau",
    previewText: "Reset your Narau account password.",
    headerMeta: "SECURITY · ACCOUNT ACCESS",
    contentHtml,
  });
}
