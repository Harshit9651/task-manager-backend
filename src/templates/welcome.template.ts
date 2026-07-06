import { wrapEmail } from '@/templates/layouts/base.layout';
import { heading, paragraph, button } from '@/templates/components/partials';
import type { RenderedEmail } from '@/interfaces/email.interface';

interface WelcomeData {
  name?: string;
  email: string;
  appName: string;
  appUrl: string;
}

export const welcomeTemplate = (d: WelcomeData): RenderedEmail => {
  const first = (d.name ?? '').split(' ')[0] || 'there';
  const content = `
    ${heading(`Welcome to ${d.appName}, ${first} 👋`)}
    ${paragraph(`Your account (${d.email}) is ready. From here you can capture leads, schedule follow-ups, and stay on top of your day — and we'll email you a reminder each morning plus a weekly summary.`)}
    ${button('Go to your dashboard', d.appUrl)}
    ${paragraph(`Tip: add a follow-up date to any lead and it'll show up in your daily reminder automatically.`)}
  `;
  return {
    subject: `Welcome to ${d.appName}`,
    html: wrapEmail({ title: `Welcome to ${d.appName}`, preheader: 'Your account is ready.', contentHtml: content, appName: d.appName, appUrl: d.appUrl }),
    text: `Welcome to ${d.appName}, ${first}!\n\nYour account (${d.email}) is ready.\nOpen your dashboard: ${d.appUrl}\n\nWe'll send a daily follow-up reminder and a weekly summary.`,
  };
};