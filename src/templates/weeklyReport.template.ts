import { wrapEmail, EMAIL_THEME as t } from '@/templates/layouts/base.layout';
import { heading, paragraph, sectionTitle, statGrid, leadRow, button, emptyNote, divider } from '@/templates/components/partials';
import type { LeadEmailItem, RenderedEmail } from '@/interfaces/email.interface';

interface WeeklyReportData {
  name?: string;
  rangeLabel: string; 
  leadStats: { total: number; won: number; hot: number; contacted: number };
  newLeads: number;
  tasks: { created: number; completed: number; pending: number };
  upcoming: LeadEmailItem[];
  appName: string;
  appUrl: string;
}

export const weeklyReportTemplate = (d: WeeklyReportData): RenderedEmail => {
  const first = (d.name ?? '').split(' ')[0] || 'there';

  let content = `
    ${heading(`Your weekly report`)}
    ${paragraph(`Hi ${first}, here's how the last week (${d.rangeLabel}) went.`)}
    ${sectionTitle('Pipeline snapshot')}
    ${statGrid([
      { label: 'Total leads', value: d.leadStats.total },
      { label: 'New this week', value: d.newLeads, color: t.brand },
      { label: 'Won', value: d.leadStats.won, color: t.success },
    ])}
    <div style="height:12px;"></div>
    ${statGrid([
      { label: 'Hot leads', value: d.leadStats.hot, color: t.danger },
      { label: 'Contacted', value: d.leadStats.contacted },
      { label: 'Tasks done', value: d.tasks.completed, color: t.success },
    ])}
    ${divider()}
    ${sectionTitle('Tasks this week')}
    ${statGrid([
      { label: 'Created', value: d.tasks.created },
      { label: 'Completed', value: d.tasks.completed, color: t.success },
      { label: 'Still pending', value: d.tasks.pending, color: t.warning },
    ])}
  `;

  content += divider();
  content += sectionTitle('Follow-ups next 7 days', d.upcoming.length);
  content += d.upcoming.length ? d.upcoming.map((l) => leadRow(l, t.brand)).join('') : emptyNote('No follow-ups scheduled for next week.');
  content += button('Open your dashboard', d.appUrl);

  const text = [
    `Weekly report — ${d.rangeLabel}`,
    '',
    `Total leads: ${d.leadStats.total} | New: ${d.newLeads} | Won: ${d.leadStats.won}`,
    `Hot: ${d.leadStats.hot} | Contacted: ${d.leadStats.contacted}`,
    `Tasks — created: ${d.tasks.created}, completed: ${d.tasks.completed}, pending: ${d.tasks.pending}`,
    '',
    `Upcoming follow-ups (${d.upcoming.length}):`,
    ...(d.upcoming.length ? d.upcoming.map((l) => `  • ${l.contactName} (${l.company}) — ${l.date ?? ''}`) : ['  none']),
    '',
    `Open: ${d.appUrl}`,
  ].join('\n');

  return {
    subject: `Your weekly report (${d.rangeLabel})`,
    html: wrapEmail({ title: 'Your weekly report', preheader: `Pipeline + tasks for ${d.rangeLabel}`, contentHtml: content, appName: d.appName, appUrl: d.appUrl, footerNote: `Weekly report from ${d.appName}. Manage or turn this off in settings.` }),
    text,
  };
};