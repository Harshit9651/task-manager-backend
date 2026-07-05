export const LEAD_TEMPERATURES = ['hot', 'warm', 'cold', 'unknown'] as const;
export type LeadTemperature = (typeof LEAD_TEMPERATURES)[number];

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'follow_up',
  'meeting_scheduled',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
  'converted_to_client'
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  'manual',
  'linkedin',
  'website',
  'email',
  'facebook',
  'instagram',
  'twitter',
  'referral',
  'cold_call',
  'event',
  'other',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];


export const LEAD_DEFAULTS = {
  source: 'manual' as LeadSource,
  temperature: 'unknown' as LeadTemperature,
  status: 'new' as LeadStatus,
};


export const LEAD_SEARCHABLE_FIELDS = ['company', 'contactName', 'email'] as const;


export const LEAD_SORTABLE_FIELDS = ['createdAt', 'company', 'contactName'] as const;


export const LEAD_CREATABLE_FIELDS = [
  'company',
  'contactName',
  'designation',
  'email',
  'phone',
  'linkedin',
  'website',
  'country',
  'city',
  'source',
  'companySize',
  'temperature',
  'status',
  'notes',
  'tags',
] as const;


export const LEAD_UPDATABLE_FIELDS = [
  ...LEAD_CREATABLE_FIELDS,
  'lastContactedAt',
  'nextFollowUp',
] as const;