import { renderEmailLayout } from "./layout";

export interface DailyLearnEmailOptions {
  userName?: string;
  subjectTitle?: string;
  areaName: string;
  userTags?: string[];
  readingMinutes?: number;
  itemUrl: string;
  dateStr?: string;
  aiCuratedLabel?: string;
}

export function renderDailyLearnEmail(options: DailyLearnEmailOptions): string {
  const {
    userName,
    subjectTitle,
    areaName,
    userTags = [],
    readingMinutes = 5,
    itemUrl,
    dateStr = "TODAY",
    aiCuratedLabel,
  } = options;

  const greeting = userName ? `Hello ${userName},` : "Hello,";

  const tagsHtml =
    userTags.length > 0
      ? userTags
          .map(
            (tag) =>
              `<span style="display:inline-block; font-family:'Courier New', Courier, monospace; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; background-color:#E5E1D7; color:#1F1A14; border:1px solid #D3CBBB; border-radius:3px; padding:3px 8px; margin-right:6px; margin-bottom:6px;">${tag}</span>`,
          )
          .join("")
      : `<span style="display:inline-block; font-family:'Courier New', Courier, monospace; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; background-color:#E5E1D7; color:#1F1A14; border:1px solid #D3CBBB; border-radius:3px; padding:3px 8px;">${areaName}</span>`;

  const contentHtml = `
    <!-- Header Tag & Date -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
      <tr>
        <td align="left">
          <span style="font-family:'Courier New', Courier, monospace; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#16A34A; border:1px solid #16A34A; border-radius:2px; padding:2px 6px;">
            ${areaName} · ${dateStr}
          </span>
        </td>
        <td align="right" style="font-family:'Courier New', Courier, monospace; font-size:11px; color:#6D6255;">
          ${readingMinutes} MIN READ
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 16px 0; font-size: 15px; color:#6D6255;">${greeting}</p>

    ${
      aiCuratedLabel
        ? `<p style="margin:0 0 14px 0; font-family:'Courier New', Courier, monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; color:#6D6255;">${aiCuratedLabel}</p>`
        : ""
    }

    <!-- Main Title / Headline -->
    <h1 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.25; color: #1F1A14;">
      Your daily card is ready in ${areaName}
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.7; color: #34220A;">
      Your personalized reading for today is waiting in your library. Open today's card to complete your daily learning ritual.
    </p>

    <!-- Assigned User Tags -->
    <div style="margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-family:'Courier New', Courier, monospace; font-size:10px; uppercase; letter-spacing:0.14em; color:#6D6255;">YOUR ACTIVE AREAS:</p>
      <div>${tagsHtml}</div>
    </div>

    <!-- Action Button -->
    <div style="margin: 32px 0 24px 0; text-align: center;">
      <a href="${itemUrl}" style="display: inline-block; background-color: #1F1A14; color: #F9F7F0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; text-decoration: none; padding: 14px 28px; border-radius: 4px; border: 1px solid #1F1A14; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
        READ TODAY'S CARD &rarr;
      </a>
    </div>

    <!-- Cool Message -->
    <p style="margin: 24px 0 0 0; text-align: center; font-style: italic; font-size: 13px; color: #6D6255; border-top: 1px dashed #D3CBBB; padding-top: 16px;">
      "One small, well-sourced thing to learn every day."
    </p>
  `;

  return renderEmailLayout({
    title: subjectTitle ? `${subjectTitle} · Today's Card` : `Today's Card in ${areaName}`,
    previewText: `Your reading for today is ready in ${areaName} (${readingMinutes} min read).`,
    headerMeta: `DAILY CARD · ${areaName.toUpperCase()}`,
    contentHtml,
  });
}
