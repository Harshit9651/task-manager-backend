import type { Types } from 'mongoose';
import type { SoftDeleteFields } from '@/database/plugins/softDelete.plugin';
import type {
  ClientStatus, DocumentCategory, InvoiceSource, InvoiceStatus, OnboardingStepKey,
} from '@/constants/client.constants';

export interface OnboardingStep {
  key: OnboardingStepKey;
  done: boolean;
  completedAt?: Date | null;
}

export interface Invoice {
  _id?: Types.ObjectId;
  invoiceNumber: string;
  title: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  source: InvoiceSource;
  fileUrl?: string | null;
  dueDate?: Date | null;
  issuedDate?: Date | null;
  createdAt?: Date;
}

export interface ClientDocument {
  _id?: Types.ObjectId;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize?: number;
  uploadedAt?: Date;
}


export interface ClientContact {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  designation?: string;
  country?: string;
  city?: string;
}

export interface IClient extends SoftDeleteFields {
  user: Types.ObjectId;
  lead: Types.ObjectId; 
  contact: ClientContact;
  finalBudget?: number;
  currency: string;
  requirements?: string;
  updatedRequirements?: string;
  onboarding: OnboardingStep[];
  invoices: Invoice[];
  documents: ClientDocument[];
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}