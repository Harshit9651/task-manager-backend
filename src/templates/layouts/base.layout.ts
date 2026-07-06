import { escapeHtml } from '@/utils/html.util';

export const EMAIL_THEME = {
  brand: '#4f46e5',
  brandDark: '#4338ca',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f3f4f6',
  card: '#ffffff',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

interface LayoutOptions {
  title: string;
  preheader?: string;
  contentHtml: string;
  appName: string;
  appUrl: string;
  footerNote?: string;
}


export const wrapEmail = (opts: LayoutOptions): string => {
  const t = EMAIL_THEME;
  const preheader = opts.preheader
    ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(opts.preheader)}</span>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${t.bg};font-family:${t.font};-webkit-font-smoothing:antialiased;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:4px 8px 16px;">
              <span style="font-size:18px;font-weight:700;color:${t.brand};letter-spacing:-0.02em;">
                ${escapeHtml(opts.appName)}
              </span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:${t.card};border:1px solid ${t.border};border-radius:14px;padding:28px 28px 8px;">
              ${opts.contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 12px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:${t.muted};line-height:1.6;">
                ${opts.footerNote ? escapeHtml(opts.footerNote) : `You're receiving this because notifications are enabled in ${escapeHtml(opts.appName)}.`}
              </p>
              <p style="margin:0;font-size:12px;color:${t.muted};">
                <a href="${escapeHtml(opts.appUrl)}/settings" style="color:${t.brand};text-decoration:none;">Manage notifications</a>
                &nbsp;·&nbsp;
                <a href="${escapeHtml(opts.appUrl)}" style="color:${t.brand};text-decoration:none;">Open ${escapeHtml(opts.appName)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};