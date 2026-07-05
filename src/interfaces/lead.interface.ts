import type { SoftDeleteFields } from '@/database/plugins/softDelete.plugin';
import type {
  CompanySize,
  LeadSource,
  LeadStatus,
  LeadTemperature,
} from '@/constants/lead.constants';

export interface ILead extends SoftDeleteFields {
  user: String;
  company: string;
  contactName: string;
  designation?: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  country?: string;
  city?: string;
  source: LeadSource;
  companySize?: CompanySize;
  temperature: LeadTemperature;
  status: LeadStatus;
  notes?: string;
  tags: string[];
  avatar?: string;
  lastContactedAt?: Date | null;
  nextFollowUp?: Date | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface LeadStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  unknown: number;
  won: number;
  lost: number;
  contacted: number;
  followUp: number;
}