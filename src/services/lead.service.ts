import { Types, type UpdateQuery } from 'mongoose';
import { BaseService } from '@/services/base.service';
import { LeadModel, type ILeadDocument } from '@/models/lead.model';
import { NotFoundError } from '@/utils/AppError';
import { LEAD_SEARCHABLE_FIELDS, LEAD_SORTABLE_FIELDS } from '@/constants/lead.constants';
import type { PaginatedResult } from '@/types/common.types';
import type { LeadStats } from '@/interfaces/lead.interface';

class LeadService extends BaseService<ILeadDocument> {
  constructor() {
    super(LeadModel, 'Lead');
  }

  async createForUser(userId: string, payload: Record<string, unknown>): Promise<ILeadDocument> {
    const lead = await LeadModel.create({
      ...payload,
      user: new Types.ObjectId(userId),
    } as unknown as Partial<ILeadDocument>);
    return lead;
  }

  async findAllForUser(
    userId: string,
    query: Record<string, unknown>,
  ): Promise<PaginatedResult<ILeadDocument>> {
    return this.findAll(this.buildRawQuery(userId, query), {
      searchableFields: [...LEAD_SEARCHABLE_FIELDS],
      defaultSort: '-createdAt',
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findByIdForUser(userId: string, id: string): Promise<ILeadDocument> {
    const lead = await LeadModel.findOne({ _id: id, user: userId });
    if (!lead) throw new NotFoundError('Lead not found');
    return lead;
  }

  async updateForUser(
    userId: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<ILeadDocument> {
    const lead = await LeadModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: payload } as UpdateQuery<ILeadDocument>,
      { new: true, runValidators: true },
    );
    if (!lead) throw new NotFoundError('Lead not found');
    return lead;
  }
  async updateStatusForUser(
  userId: string,
  id: string,
  status: string,
): Promise<ILeadDocument> {
  const lead = await LeadModel.findOneAndUpdate(
    { _id: id, user: userId },
    {
      $set: {
        status,
        lastContactedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!lead) throw new NotFoundError('Lead not found');

  return lead;
}

async updateFollowUpForUser(
  userId: string,
  id: string,
  nextFollowUp: Date | null,
): Promise<ILeadDocument> {
  const lead = await LeadModel.findOneAndUpdate(
    { _id: id, user: userId },
    {
      $set: {
        nextFollowUp,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!lead) throw new NotFoundError('Lead not found');

  return lead;
}

  async softDeleteForUser(userId: string, id: string): Promise<void> {
    const lead = await LeadModel.findOne({ _id: id, user: userId });
    if (!lead) throw new NotFoundError('Lead not found');
    await lead.softDelete(userId);
  }

  async restoreForUser(userId: string, id: string): Promise<ILeadDocument> {
    const lead = await LeadModel.findOneWithDeleted({ _id: id, user: userId });
    if (!lead) throw new NotFoundError('Lead not found');
    await lead.restore();
    return lead;
  }

  async setArchiveForUser(userId: string, id: string, isArchived: boolean): Promise<ILeadDocument> {
    const lead = await LeadModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { isArchived } },
      { new: true },
    );
    if (!lead) throw new NotFoundError('Lead not found');
    return lead;
  }

  async getStatsForUser(userId: string): Promise<LeadStats> {
  
    const [result] = await LeadModel.aggregate<Record<string, number>>([
      { $match: { user: new Types.ObjectId(userId), isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          hot: { $sum: { $cond: [{ $eq: ['$temperature', 'hot'] }, 1, 0] } },
          warm: { $sum: { $cond: [{ $eq: ['$temperature', 'warm'] }, 1, 0] } },
          cold: { $sum: { $cond: [{ $eq: ['$temperature', 'cold'] }, 1, 0] } },
          unknown: { $sum: { $cond: [{ $eq: ['$temperature', 'unknown'] }, 1, 0] } },
          won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          contacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
          followUp: { $sum: { $cond: [{ $eq: ['$status', 'follow_up'] }, 1, 0] } },
        },
      },
    ]);

    return {
      total: result?.total ?? 0,
      hot: result?.hot ?? 0,
      warm: result?.warm ?? 0,
      cold: result?.cold ?? 0,
      unknown: result?.unknown ?? 0,
      won: result?.won ?? 0,
      lost: result?.lost ?? 0,
      contacted: result?.contacted ?? 0,
      followUp: result?.followUp ?? 0,
    };
  }

  private buildRawQuery(userId: string, q: Record<string, unknown>): Record<string, unknown> {
    const raw: Record<string, unknown> = {
      user: userId, 
      page: q.page,
      limit: q.limit,
      search: q.search,
    };

    for (const key of ['status', 'temperature', 'source', 'companySize', 'isArchived'] as const) {
      if (q[key] !== undefined && q[key] !== '') raw[key] = q[key];
    }

    const sortByRaw = String(q.sortBy ?? '');
    const sortBy = (LEAD_SORTABLE_FIELDS as readonly string[]).includes(sortByRaw)
      ? sortByRaw
      : 'createdAt';
    const dir = q.sortOrder === 'asc' ? '' : '-';
    raw.sort = `${dir}${sortBy}`;

    return raw;
  }
  async getFollowUpBuckets(userId: string, timeZone: string) {
    const { getTodayInTimezone, formatDateInTimezone, formatTimeInTimezone } = await import('@/utils/datetime.util');
    const today = getTodayInTimezone(timeZone);

    const leads = await LeadModel.find({ user: new Types.ObjectId(userId), nextFollowUp: { $ne: null } }).sort({ nextFollowUp: 1 });

    const dueToday = [] as ReturnType<typeof this.toEmailItem>[];
    const overdue = [] as ReturnType<typeof this.toEmailItem>[];
    for (const lead of leads) {
      if (!lead.nextFollowUp) continue;
      const day = formatDateInTimezone(lead.nextFollowUp, timeZone);
      const item = this.toEmailItem(lead, { time: formatTimeInTimezone(lead.nextFollowUp, timeZone) });
      if (day === today) dueToday.push(item);
      else if (day < today) overdue.push(item);
    }
    return { today, dueToday, overdue };
  }

  async getUpcomingFollowUps(userId: string, timeZone: string, days = 7) {
    const { getTodayInTimezone, dateOffsetInTimezone, formatDateInTimezone, formatShortDate } = await import('@/utils/datetime.util');
    const today = getTodayInTimezone(timeZone);
    const until = dateOffsetInTimezone(days, timeZone);

    const leads = await LeadModel.find({ user: new Types.ObjectId(userId), nextFollowUp: { $ne: null } }).sort({ nextFollowUp: 1 });
    return leads
      .filter((l) => {
        if (!l.nextFollowUp) return false;
        const day = formatDateInTimezone(l.nextFollowUp, timeZone);
        return day > today && day <= until;
      })
      .map((l) => this.toEmailItem(l, { date: formatShortDate(l.nextFollowUp as Date, timeZone) }));
  }

  countCreatedSince(userId: string, since: Date) {
    return LeadModel.countDocuments({ user: new Types.ObjectId(userId), createdAt: { $gte: since } });
  }

  private toEmailItem(lead: ILeadDocument, extra: { time?: string; date?: string }) {
    return {
      company: lead.company,
      contactName: lead.contactName,
      email: lead.email,
      status: lead.status,
      temperature: lead.temperature,
      ...extra,
    };
  }
}

export const leadService = new LeadService();