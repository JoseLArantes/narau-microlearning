export interface BaseLayoutOptions {
  title: string;
  previewText?: string;
  headerMeta?: string;
  contentHtml: string;
  footerNote?: string;
}

export function renderEmailLayout(options: BaseLayoutOptions): string {
  const { title, previewText = "", headerMeta = "NARAU · DAILY DIGEST", contentHtml, footerNote } = options;
  const baseUrl = process.env.APP_URL ?? "http://localhost:3030";

  const logoMarkup = `<img src="${baseUrl}/narau_logo.png" alt="Narau" width="130" height="32" style="display:block; border:0; outline:none; max-width:130px; height:auto;" />`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
    td, th {font-family: Georgia, serif;}
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#E5E1D7; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing:antialiased; color:#1F1A14;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#E5E1D7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#E5E1D7; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px; background-color:#F9F7F0; border:1px solid #D3CBBB; border-radius:8px; box-shadow: 0 4px 16px rgba(48,34,12,0.08); overflow:hidden;">
          
          <!-- Top Masthead Strip -->
          <tr>
            <td style="background-color:#EFECE6; border-bottom:1px solid #D3CBBB; padding:12px 24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-family:'Courier New', Courier, monospace; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.14em; color:#6D6255;">
                      ${headerMeta}
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-family:'Courier New', Courier, monospace; font-size:10px; color:#8C8070;">
                      ONE SMALL THING A DAY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header Logo Row -->
          <tr>
            <td style="padding: 28px 32px 16px 32px; border-bottom: 1px solid #EFECE6;">
              <a href="${baseUrl}" style="text-decoration:none; display:inline-block;">
                ${logoMarkup}
              </a>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.65; color: #1F1A14;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color:#EFECE6; border-top:1px solid #D3CBBB; padding: 24px 32px; font-family:'Courier New', Courier, monospace; font-size: 11px; color:#6D6255; line-height:1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 700; color: #1F1A14;">NARAU MICROLEARNING</p>
              <p style="margin: 0 0 12px 0;">
                Content is sourced from Wikipedia under <a href="https://creativecommons.org/licenses/by-sa/4.0/" style="color:#6D6255; text-decoration:underline;">CC BY-SA 4.0</a>.
              </p>
              ${footerNote ? `<p style="margin: 0; color: #8C8070;">${footerNote}</p>` : ""}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
