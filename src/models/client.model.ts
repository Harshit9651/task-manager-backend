import { Schema, model, type Document } from 'mongoose';
import {
  softDeletePlugin,
  type SoftDeleteMethods,
  type SoftDeleteModel,
} from '@/database/plugins/softDelete.plugin';
import {
  CLIENT_STATUSES, DOCUMENT_CATEGORIES, INVOICE_SOURCES, INVOICE_STATUSES,
  ONBOARDING_STEP_KEYS, buildDefaultOnboarding,
} from '@/constants/client.constants';
import type { IClient } from '@/interfaces/client.interface';

export interface IClientDocument extends IClient, Document, SoftDeleteMethods {}

const onboardingSchema = new Schema(
  {
    key: { type: String, enum: [...ONBOARDING_STEP_KEYS], required: true },
    done: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: [...INVOICE_STATUSES], default: 'draft' },
    source: { type: String, enum: [...INVOICE_SOURCES], default: 'created' },
    fileUrl: { type: String, default: null },
    dueDate: { type: Date, default: null },
    issuedDate: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }, // each invoice keeps its own createdAt
);

const documentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: [...DOCUMENT_CATEGORIES], default: 'other' },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const contactSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true },
    designation: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
  },
  { _id: false },
);

const clientSchema = new Schema<IClientDocument>(
  {

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },

    contact: { type: contactSchema, required: true },
    finalBudget: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    requirements: { type: String, maxlength: 20000 },
    updatedRequirements: { type: String, maxlength: 20000 },

    onboarding: { type: [onboardingSchema], default: buildDefaultOnboarding },
    invoices: { type: [invoiceSchema], default: [] },
    documents: { type: [documentSchema], default: [] },

    status: { type: String, enum: [...CLIENT_STATUSES], default: 'active', index: true },
  },
  {
 
    toJSON: {
      virtuals: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret._id = String(ret._id);
        if (ret.user) ret.user = String(ret.user);
        if (ret.lead) ret.lead = String(ret.lead);
        delete ret.id;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
  },
);

clientSchema.plugin(softDeletePlugin);

clientSchema.index({ user: 1, updatedAt: -1 });
clientSchema.index({ user: 1, status: 1 });
// One client per lead per user (prevents double-conversion).
clientSchema.index({ user: 1, lead: 1 }, { unique: true });

export const ClientModel = model<IClientDocument>('Client', clientSchema) as SoftDeleteModel<IClientDocument>;