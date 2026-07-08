export const ONBOARDING_STEP_KEYS = [
  'nda_sent',
  'welcome_letter_sent',
  'requirements_collected',
  'invoice_sent',
  'kickoff_done',
] as const;
export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number];

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_SOURCES = ['created', 'uploaded'] as const;
export type InvoiceSource = (typeof INVOICE_SOURCES)[number];

export const DOCUMENT_CATEGORIES = ['requirement', 'updated_requirement', 'payment_proof', 'other'] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const CLIENT_STATUSES = ['active', 'completed', 'paused'] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const buildDefaultOnboarding = () =>
  ONBOARDING_STEP_KEYS.map((key) => ({ key, done: false, completedAt: null as Date | null }));

export const CLIENT_SEARCHABLE_FIELDS = ['contact.company', 'contact.contactName', 'contact.email'] as const;