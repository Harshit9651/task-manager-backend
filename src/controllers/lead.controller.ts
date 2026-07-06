import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { leadService } from '@/services/lead.service';
import { sendCreated, sendSuccess } from '@/utils/ApiResponse';
import { pick } from '@/utils/pick';
import { MESSAGES } from '@/constants/messages';
import { LEAD_CREATABLE_FIELDS, LEAD_UPDATABLE_FIELDS } from '@/constants/lead.constants';

const stripEmptyStrings = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== ''));

class LeadController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = stripEmptyStrings(pick(req.body, LEAD_CREATABLE_FIELDS));
    const lead = await leadService.createForUser(req.user!.id, payload);
    sendCreated(res, { lead }, 'Lead created successfully');
  });


  list = asyncHandler(async (req: Request, res: Response) => {
    const { results, meta } = await leadService.findAllForUser(
      req.user!.id,
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, {
      message: MESSAGES.FETCHED,
      data: {
        leads: results,
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.totalPages,
      },
    });
  });


  stats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await leadService.getStatsForUser(req.user!.id);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { stats } });
  });


  getById = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.findByIdForUser(req.user!.id,String(req.params.id));
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { lead } });
  });


  update = asyncHandler(async (req: Request, res: Response) => {
    const payload = stripEmptyStrings(pick(req.body, LEAD_UPDATABLE_FIELDS));
    const lead = await leadService.updateForUser(req.user!.id, String(req.params.id), payload);
    sendSuccess(res, { message: 'Lead updated successfully', data: { lead } });
  });
updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.updateStatusForUser(
    req.user!.id,
    String(req.params.id),
    req.body.status
  );

  sendSuccess(res, {
    message: "Lead status updated successfully",
    data: { lead },
  });
});

updateFollowUp = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.updateFollowUpForUser(
    req.user!.id,
    String(req.params.id),
    req.body.nextFollowUp ?? null
  );

  sendSuccess(res, {
    message: "Follow up updated successfully",
    data: { lead },
  });
});

  remove = asyncHandler(async (req: Request, res: Response) => {
    await leadService.softDeleteForUser(req.user!.id, String(req.params.id));
    sendSuccess(res, { message: 'Lead deleted successfully', data: { id: req.params.id } });
  });


  archive = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.setArchiveForUser(req.user!.id, String(req.params.id), true);
    sendSuccess(res, { message: 'Lead archived successfully', data: { lead } });
  });


  unarchive = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.setArchiveForUser(req.user!.id, String(req.params.id), false);
    sendSuccess(res, { message: 'Lead unarchived successfully', data: { lead } });
  });


  restore = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.restoreForUser(req.user!.id, String(req.params.id));
    sendSuccess(res, { message: MESSAGES.RESTORED, data: { lead } });
  });
}

export const leadController = new LeadController();