import { Schema, model, type Document } from 'mongoose';
import {
  softDeletePlugin,
  type SoftDeleteMethods,
  type SoftDeleteModel,
} from '@/database/plugins/softDelete.plugin';
import {
  COMPANY_SIZES,
  LEAD_DEFAULTS,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
} from '@/constants/lead.constants';
import type { ILead } from '@/interfaces/lead.interface';

export interface ILeadDocument extends ILead, Document, SoftDeleteMethods {}

const leadSchema = new Schema<ILeadDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    company: { type: String, required: true, trim: true, maxlength: 200 },
    contactName: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, lowercase: true, trim: true },
    designation: { type: String, trim: true, maxlength: 150 },
    phone: { type: String, trim: true, maxlength: 30 },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true },
    country: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 100 },

   
    source: { type: String, enum: [...LEAD_SOURCES], default: LEAD_DEFAULTS.source },
    companySize: { type: String, enum: [...COMPANY_SIZES] },
    temperature: { type: String, enum: [...LEAD_TEMPERATURES], default: LEAD_DEFAULTS.temperature },
    status: { type: String, enum: [...LEAD_STATUSES], default: LEAD_DEFAULTS.status },

    notes: { type: String, trim: true, maxlength: 5000 },
    tags: { type: [String], default: [] },
    avatar: { type: String, trim: true },

    lastContactedAt: { type: Date, default: null },
    nextFollowUp: { type: Date, default: null },

    isArchived: { type: Boolean, default: false },
  },
  {

   
    toJSON: {
      virtuals: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret._id = String(ret._id);
        if (ret.user) ret.user = String(ret.user);
        delete ret.id;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
  },
);

leadSchema.plugin(softDeletePlugin);


leadSchema.index({ user: 1, createdAt: -1 }); 
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, temperature: 1 });
leadSchema.index({ user: 1, email: 1 }); 

export const LeadModel = model<ILeadDocument>('Lead', leadSchema) as SoftDeleteModel<ILeadDocument>;