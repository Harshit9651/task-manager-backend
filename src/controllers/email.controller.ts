import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/ApiResponse';
import { userService } from '@/services/user.service';
import { reminderService } from '@/services/reminder.service';
import { reportService } from '@/services/report.service';
import { sendWelcomeEmail } from '@/services/welcome.service';
import { UserModel } from '@/models/user.model';
import { NotFoundError } from '@/utils/AppError';
import { MESSAGES } from '@/constants/messages';

class EmailController {
  getPreferences = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.findById(req.user!.id);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { preferences: user.notificationPreferences } });
  });

  updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    const { dailyFollowUpReminder, weeklyReport, timezone } = req.body as { dailyFollowUpReminder?: boolean; weeklyReport?: boolean; timezone?: string };
    const set: Record<string, unknown> = {};
    if (dailyFollowUpReminder !== undefined) set['notificationPreferences.dailyFollowUpReminder'] = dailyFollowUpReminder;
    if (weeklyReport !== undefined) set['notificationPreferences.weeklyReport'] = weeklyReport;
    if (timezone !== undefined) set['notificationPreferences.timezone'] = timezone;

    const user = await UserModel.findByIdAndUpdate(req.user!.id, { $set: set }, { new: true, runValidators: true });
    if (!user) throw new NotFoundError('User not found');
    sendSuccess(res, { message: 'Preferences updated', data: { preferences: user.notificationPreferences } });
  });

  testWelcome = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.findById(req.user!.id);
    await sendWelcomeEmail({ id: user.id, email: user.email, name: user.name }, { throwOnError: true });
    sendSuccess(res, { message: `Welcome email sent to ${user.email}` });
  });

  testDailyReminder = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user!.id);
    if (!user) throw new NotFoundError('User not found');
    const result = await reminderService.sendForUser(user, { force: true });
    sendSuccess(res, { message: `Daily reminder: ${result.status}`, data: { result } });
  });

  testWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user!.id);
    if (!user) throw new NotFoundError('User not found');
    const result = await reportService.sendForUser(user, { force: true });
    sendSuccess(res, { message: `Weekly report: ${result.status}`, data: { result } });
  });
}

export const emailController = new EmailController();