import { body } from 'express-validator';
const SUPPORTED_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Australia/Sydney',
];

export const updateNotificationValidator = [
  body('dailyFollowUpReminder').optional().isBoolean().withMessage('dailyFollowUpReminder must be a boolean').toBoolean(),
  body('weeklyReport').optional().isBoolean().withMessage('weeklyReport must be a boolean').toBoolean(),
  body('timezone')
    .optional()
    .isString()
    .trim()
    .isIn(SUPPORTED_TIMEZONES)
    .withMessage('Unsupported timezone'),
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('Provide at least one field to update');
    }
    return true;
  }),
];

export { SUPPORTED_TIMEZONES };