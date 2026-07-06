import { wrapEmail, EMAIL_THEME as t } from '@/templates/layouts/base.layout';
import { heading, paragraph, sectionTitle, leadRow, taskRow, button, emptyNote, divider } from '@/templates/components/partials';
import type { LeadEmailItem, RenderedEmail, TaskEmailItem } from '@/interfaces/email.interface';

interface ReminderData {
  name?: string;
  dateLabel: string;
  dueToday: LeadEmailItem[];
  overdue: LeadEmailItem[];
  tasks: TaskEmailItem[];
  appName: string;
  appUrl: string;
}

export const followUpReminderTemplate = (d: ReminderData): RenderedEmail => {
  const first = (d.name ?? '').split(' ')[0] || 'there';
  const total = d.dueToday.length + d.overdue.length;

  let content = `
    ${heading(`Good morning, ${first}`)}
    ${paragraph(`Here's your follow-up plan for ${d.dateLabel}. You have ${total} follow-up${total === 1 ? '' : 's'} to handle${d.tasks.length ? ` and ${d.tasks.length} task${d.tasks.length === 1 ? '' : 's'}` : ''}.`)}
  `;

  content += sectionTitle('Due today', d.dueToday.length);
  content += d.dueToday.length ? d.dueToday.map((l) => leadRow(l, t.brand)).join('') : emptyNote('No follow-ups scheduled for today.');

  if (d.overdue.length) {
    content += sectionTitle('Overdue', d.overdue.length);
    content += d.overdue.map((l) => leadRow(l, t.danger)).join('');
  }

  if (d.tasks.length) {
    content += divider();
    content += sectionTitle("Today's tasks", d.tasks.length);
    content += d.tasks.map(taskRow).join('');
  }

  content += button('Open your pipeline', `${d.appUrl}/leads`);

  const textLines = [
    `Good morning, ${first}`,
    `Follow-up plan for ${d.dateLabel}`,
    '',
    `DUE TODAY (${d.dueToday.length}):`,
    ...(d.dueToday.length ? d.dueToday.map((l) => `  • ${l.contactName} (${l.company}) — ${l.time ?? ''}`) : ['  none']),
  ];
  if (d.overdue.length) textLines.push('', `OVERDUE (${d.overdue.length}):`, ...d.overdue.map((l) => `  • ${l.contactName} (${l.company})`));
  if (d.tasks.length) textLines.push('', `TASKS (${d.tasks.length}):`, ...d.tasks.map((t2) => `  • ${t2.title} [${t2.priority}]`));
  textLines.push('', `Open: ${d.appUrl}/leads`);

  return {
    subject: `Your follow-ups for today${total ? ` (${total})` : ''}`,
    html: wrapEmail({ title: 'Your daily follow-ups', preheader: `${total} follow-up${total === 1 ? '' : 's'} for ${d.dateLabel}`, contentHtml: content, appName: d.appName, appUrl: d.appUrl, footerNote: `Daily reminder from ${d.appName}. Manage or turn this off in settings.` }),
    text: textLines.join('\n'),
  };
};