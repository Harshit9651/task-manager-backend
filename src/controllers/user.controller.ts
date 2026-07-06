import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/ApiResponse';
import { userService } from '@/services/user.service';
import { UserModel } from '@/models/user.model';
import { NotFoundError } from '@/utils/AppError';
import { MESSAGES } from '@/constants/messages';

class UserController {

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.findById(req.user!.id);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { user } });
  });

 
  updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
    const { dailyFollowUpReminder, weeklyReport, timezone } = req.body as {
      dailyFollowUpReminder?: boolean;
      weeklyReport?: boolean;
      timezone?: string;
    };


    const set: Record<string, unknown> = {};
    if (dailyFollowUpReminder !== undefined)
      set['notificationPreferences.dailyFollowUpReminder'] = dailyFollowUpReminder;
    if (weeklyReport !== undefined) set['notificationPreferences.weeklyReport'] = weeklyReport;
    if (timezone !== undefined) set['notificationPreferences.timezone'] = timezone;

    const user = await UserModel.findByIdAndUpdate(
      req.user!.id,
      { $set: set },
      { new: true, runValidators: true },
    );
    if (!user) throw new NotFoundError('User not found');
   

    sendSuccess(res, { message: 'Notification preferences updated', data: { user } });
  });
}

export const userController = new UserController();