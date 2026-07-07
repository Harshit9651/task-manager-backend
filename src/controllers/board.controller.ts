import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { boardService } from '@/services/board.service';
import { sendCreated, sendSuccess } from '@/utils/ApiResponse';
import { pick } from '@/utils/pick';
import { MESSAGES } from '@/constants/messages';

class BoardController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const { title, boardDate } = req.body as { title: string; boardDate: string };
    const board = await boardService.createForUser(req.user!.id, { title, boardDate });
    console.log(board)
    sendCreated(res, { board }, 'Board created successfully');
  });


  list = asyncHandler(async (req: Request, res: Response) => {
    const boards = await boardService.listForUser(req.user!.id);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { boards, total: boards.length } });
  });


  getById = asyncHandler(async (req: Request, res: Response) => {
    const board = await boardService.findByIdForUser(req.user!.id, String(req.params.id));
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { board } });
  });


  update = asyncHandler(async (req: Request, res: Response) => {
    const payload = pick(req.body, ['title', 'boardDate', 'snapshot', 'thumbnail']);
    const board = await boardService.updateForUser(req.user!.id, String(req.params.id), payload);
    console.log(board,"ye hogya")
    sendSuccess(res, { message: 'Board saved', data: { board } });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await boardService.softDeleteForUser(req.user!.id,String(req.params.id));
    sendSuccess(res, { message: 'Board deleted successfully', data: { id: req.params.id } });
  });
}

export const boardController = new BoardController();