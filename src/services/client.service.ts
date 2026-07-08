
import { BaseService } from '@/services/base.service';
import { ClientModel, type IClientDocument } from '@/models/client.model';

import { NotFoundError} from '@/utils/AppError';
import type { ILeadDocument } from '@/models/lead.model';
import {
  buildDefaultOnboarding,
  type OnboardingStepKey,
  type InvoiceStatus,
  type DocumentCategory,
} from '@/constants/client.constants';
import type { ClientContact, Invoice } from '@/interfaces/client.interface';

const LIST_PROJECTION = 'contact finalBudget currency status onboarding invoices createdAt updatedAt';

const generateInvoiceNumber = (): string => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `INV-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
};

class ClientService extends BaseService<IClientDocument> {
  constructor() {
    super(ClientModel, 'Client');
  }

 
  async createFromLead(lead: ILeadDocument): Promise<IClientDocument> {
    const userId = lead.user;
    const existing = await ClientModel.findOne({ user: userId, lead: lead._id });
    if (existing) return existing;

    const contact: ClientContact = {
      company: lead.company,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      linkedin: lead.linkedin,
      website: lead.website,
      designation: lead.designation,
      country: lead.country,
      city: lead.city,
    };

    try {
      return await ClientModel.create({
        user: userId,
        lead: lead._id,
        contact,
        currency: 'USD',
        onboarding: buildDefaultOnboarding(),
        invoices: [],
        documents: [],
        status: 'active',
      });
    } catch (err) {
      // Unique index race → someone created it in parallel; fetch and return.
      if ((err as { code?: number }).code === 11000) {
        const client = await ClientModel.findOne({ user: userId, lead: lead._id });
        if (client) return client;
      }
      throw err;
    }
  }

  async listForUser(userId: string) {
    const clients = await ClientModel.find({ user: userId })
      .select(LIST_PROJECTION)
      .sort({ updatedAt: -1 })
      .exec();

    // Compute list-friendly fields.
    return clients.map((c) => {
      const total = c.onboarding.length || 1;
      const done = c.onboarding.filter((s) => s.done).length;
      return {
        _id: String(c._id),
        contact: c.contact,
        finalBudget: c.finalBudget,
        currency: c.currency,
        status: c.status,
        onboardingProgress: Math.round((done / total) * 100),
        invoiceCount: c.invoices.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
  }

  async findByIdForUser(userId: string, id: string): Promise<IClientDocument> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');
    return client;
  }

  async updateForUser(userId: string, id: string, payload: Record<string, unknown>): Promise<IClientDocument> {
    // Flatten contact.* so we don't overwrite the whole contact object.
    const set: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (key === 'contact' && value && typeof value === 'object') {
        for (const [ck, cv] of Object.entries(value as Record<string, unknown>)) {
          if (cv !== undefined) set[`contact.${ck}`] = cv;
        }
      } else if (value !== undefined) {
        set[key] = value;
      }
    }
    const client = await ClientModel.findOneAndUpdate({ _id: id, user: userId }, { $set: set }, { new: true, runValidators: true });
    if (!client) throw new NotFoundError('Client not found');
    return client;
  }

  async toggleOnboarding(userId: string, id: string, key: OnboardingStepKey, done: boolean): Promise<IClientDocument> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');
    const step = client.onboarding.find((s) => s.key === key);
    if (!step) throw new NotFoundError('Onboarding step not found');
    step.done = done;
    step.completedAt = done ? new Date() : null;
    await client.save();
    return client;
  }

  async addInvoice(userId: string, id: string, data: Partial<Invoice> & { fileUrl?: string | null }): Promise<{ client: IClientDocument; invoice: Invoice }> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');

    const invoice: Invoice = {
      invoiceNumber: generateInvoiceNumber(),
      title: data.title ?? 'Invoice',
      amount: data.amount ?? 0,
      currency: data.currency ?? client.currency,
      status: (data.status as InvoiceStatus) ?? 'draft',
      source: data.source ?? 'created',
      fileUrl: data.fileUrl ?? null,
      dueDate: data.dueDate ?? null,
      issuedDate: data.status === 'sent' ? new Date() : null,
    };
    client.invoices.push(invoice);
    await client.save();
    const saved = client.invoices[client.invoices.length - 1];
    return { client, invoice: saved };
  }

  async updateInvoiceStatus(userId: string, id: string, invId: string, status: InvoiceStatus): Promise<IClientDocument> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');
    const invoice = client.invoices.id(invId);
    if (!invoice) throw new NotFoundError('Invoice not found');
    invoice.status = status;
    if (status === 'sent' && !invoice.issuedDate) invoice.issuedDate = new Date();
    await client.save();
    return client;
  }

  async deleteInvoice(userId: string, id: string, invId: string): Promise<IClientDocument> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');
    const invoice = client.invoices.id(invId);
    if (!invoice) throw new NotFoundError('Invoice not found');
    invoice.deleteOne();
    await client.save();
    return client;
  }

  async addDocument(userId: string, id: string, doc: { name: string; category: DocumentCategory; fileUrl: string; fileSize?: number }): Promise<{ client: IClientDocument; document: unknown }> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');
    client.documents.push({ ...doc, uploadedAt: new Date() });
    await client.save();
    const saved = client.documents[client.documents.length - 1];
    return { client, document: saved };
  }

  async deleteDocument(userId: string, id: string, docId: string): Promise<IClientDocument> {
    const client = await ClientModel.findOne({ _id: id, user: userId });
    if (!client) throw new NotFoundError('Client not found');
    const doc = client.documents.id(docId);
    if (!doc) throw new NotFoundError('Document not found');
    doc.deleteOne();
    await client.save();
    return client;
  }
}

export const clientService = new ClientService();