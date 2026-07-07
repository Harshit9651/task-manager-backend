import { Types, type UpdateQuery } from 'mongoose';
import { BaseService } from '@/services/base.service';
import { BoardModel, type IBoardDocument } from '@/models/board.model';
import { NotFoundError } from '@/utils/AppError';
const LIST_PROJECTION = 'title boardDate thumbnail createdAt updatedAt user';

class BoardService extends BaseService<IBoardDocument> {
  constructor() {
    super(BoardModel, 'Board');
  }

  async createForUser(userId: string, payload: { title: string; boardDate: string }): Promise<IBoardDocument> {
    return BoardModel.create({
      user: new Types.ObjectId(userId),
      title: payload.title,
      boardDate: payload.boardDate,
      snapshot: null,
      thumbnail: null,
    });
  }

  async listForUser(userId: string): Promise<IBoardDocument[]> {
    return BoardModel.find({ user: userId })
      .select(LIST_PROJECTION)
      .sort({ updatedAt: -1 })
      .exec();
  }


  async findByIdForUser(userId: string, id: string): Promise<IBoardDocument> {
    const board = await BoardModel.findOne({ _id: id, user: userId });
    if (!board) throw new NotFoundError('Board not found');
    return board;
  }

  async updateForUser(
    userId: string,
    id: string,
    payload: Partial<Pick<IBoardDocument, 'title' | 'boardDate' | 'snapshot' | 'thumbnail'>>,
  ): Promise<IBoardDocument> {
    const board = await BoardModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: payload } as UpdateQuery<IBoardDocument>,
      { new: true, runValidators: true },
    );
    if (!board) throw new NotFoundError('Board not found');
    return board;
  }

  async softDeleteForUser(userId: string, id: string): Promise<void> {
    const board = await BoardModel.findOne({ _id: id, user: userId });
    if (!board) throw new NotFoundError('Board not found');
    await board.softDelete(userId);
  }
}

export const boardService = new BoardService();