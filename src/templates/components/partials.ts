import { escapeHtml } from '@/utils/html.util';
import { EMAIL_THEME as t } from '@/templates/layouts/base.layout';
import type { LeadEmailItem, TaskEmailItem } from '@/interfaces/email.interface';

export const heading = (text: string): string =>
  `<h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${t.text};letter-spacing:-0.02em;">${escapeHtml(text)}</h1>`;

export const paragraph = (text: string): string =>
  `<p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:${t.muted};">${escapeHtml(text)}</p>`;

export const sectionTitle = (text: string, count?: number): string =>
  `<p style="margin:22px 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${t.muted};">
     ${escapeHtml(text)}${count !== undefined ? ` <span style="color:${t.brand};">(${count})</span>` : ''}
   </p>`;

export const button = (text: string, url: string): string =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
     <tr><td style="border-radius:10px;background:${t.brand};">
       <a href="${escapeHtml(url)}" style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(text)}</a>
     </td></tr>
   </table>`;

export const divider = (): string =>
  `<div style="height:1px;background:${t.border};margin:18px 0;"></div>`;

const tempColor = (temp: string): string =>
  ({ hot: t.danger, warm: t.warning, cold: t.brand }[temp] ?? t.muted);


export const leadRow = (lead: LeadEmailItem, accent = t.border): string => {
  const meta = lead.time ?? lead.date ?? '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
    <tr><td style="border:1px solid ${t.border};border-left:3px solid ${accent};border-radius:10px;padding:12px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;">
          <div style="font-size:14px;font-weight:600;color:${t.text};">${escapeHtml(lead.contactName)}</div>
          <div style="font-size:12px;color:${t.muted};margin-top:2px;">${escapeHtml(lead.company)} · ${escapeHtml(lead.email)}</div>
          <div style="margin-top:6px;">
            <span style="font-size:11px;color:${tempColor(lead.temperature)};text-transform:capitalize;">● ${escapeHtml(lead.temperature)}</span>
            <span style="font-size:11px;color:${t.muted};text-transform:capitalize;">&nbsp;·&nbsp;${escapeHtml(lead.status.replace(/_/g, ' '))}</span>
          </div>
        </td>
        ${meta ? `<td align="right" style="vertical-align:top;white-space:nowrap;">
          <span style="font-size:12px;font-weight:600;color:${t.brand};">${escapeHtml(meta)}</span>
        </td>` : ''}
      </tr></table>
    </td></tr>
  </table>`;
};

export const taskRow = (task: TaskEmailItem): string => {
  const prColor = { high: t.danger, medium: t.warning, low: t.brand }[task.priority] ?? t.muted;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
    <tr><td style="border:1px solid ${t.border};border-radius:10px;padding:10px 14px;">
      <span style="font-size:14px;color:${task.completed ? t.muted : t.text};${task.completed ? 'text-decoration:line-through;' : 'font-weight:600;'}">${escapeHtml(task.title)}</span>
      <span style="font-size:11px;color:${prColor};text-transform:capitalize;margin-left:8px;">${escapeHtml(task.priority)}</span>
      ${task.dueTime ? `<span style="font-size:11px;color:${t.muted};margin-left:6px;">${escapeHtml(task.dueTime)}</span>` : ''}
    </td></tr>
  </table>`;
};


export const statGrid = (items: { label: string; value: number | string; color?: string }[]): string => {
  const cells = items
    .map(
      (i) => `<td style="padding:6px;" width="33%">
        <div style="border:1px solid ${t.border};border-radius:10px;padding:14px 12px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${i.color ?? t.text};">${escapeHtml(i.value)}</div>
          <div style="font-size:11px;color:${t.muted};text-transform:uppercase;letter-spacing:0.04em;margin-top:2px;">${escapeHtml(i.label)}</div>
        </div>
      </td>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
};

export const emptyNote = (text: string): string =>
  `<p style="margin:0 0 12px;font-size:13px;color:${t.muted};font-style:italic;">${escapeHtml(text)}</p>`;