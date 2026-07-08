import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { clientService } from '@/services/client.service';
import { sendCreated, sendSuccess } from '@/utils/ApiResponse';
import { pick } from '@/utils/pick';
import { BadRequestError } from '@/utils/AppError';
import { fileUrlFor } from '@/middleware/upload';
import { MESSAGES } from '@/constants/messages';
import type { DocumentCategory, InvoiceStatus, OnboardingStepKey } from '@/constants/client.constants';

class ClientController {

  list = asyncHandler(async (req: Request, res: Response) => {
    const clients = await clientService.listForUser(req.user!.id);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { clients, total: clients.length } });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.findByIdForUser(req.user!.id, String(req.params.id));
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { client } });
  });


  update = asyncHandler(async (req: Request, res: Response) => {
    const payload = pick(req.body, ['contact', 'finalBudget', 'currency', 'requirements', 'updatedRequirements', 'status']);
    const client = await clientService.updateForUser(req.user!.id,String(req.params.id), payload);
    sendSuccess(res, { message: 'Client updated', data: { client } });
  });


  toggleOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const { key, done } = req.body as { key: OnboardingStepKey; done: boolean };
    const client = await clientService.toggleOnboarding(req.user!.id, String(req.params.id), key, done);
    sendSuccess(res, { message: 'Onboarding updated', data: { client } });
  });


  addInvoice = asyncHandler(async (req: Request, res: Response) => {
    const payload = pick(req.body, ['title', 'amount', 'currency', 'status', 'source', 'dueDate']);
    const { client, invoice } = await clientService.addInvoice(req.user!.id, String(req.params.id), payload);
    sendCreated(res, { invoice, client }, 'Invoice added');
  });


  updateInvoiceStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status: InvoiceStatus };
    const client = await clientService.updateInvoiceStatus(req.user!.id, String(req.params.id), String(req.params.invId), status);
    sendSuccess(res, { message: 'Invoice updated', data: { client } });
  });


  deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.deleteInvoice(req.user!.id,String(req.params.id), String(req.params.invId));
    sendSuccess(res, { message: 'Invoice removed', data: { client } });
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No file uploaded');
    const category = (req.body.category as DocumentCategory) ?? 'other';
    const name = (req.body.name as string) || req.file.originalname;
    const { client, document } = await clientService.addDocument(req.user!.id, String(req.params.id), {
      name,
      category,
      fileUrl: fileUrlFor(req.file.filename),
      fileSize: req.file.size,
    });
    sendCreated(res, { document, client }, 'Document uploaded');
  });


  deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.deleteDocument(req.user!.id, String(req.params.id), String(req.params.docId));
    sendSuccess(res, { message: 'Document removed', data: { client } });
  });
}

export const clientController = new ClientController();