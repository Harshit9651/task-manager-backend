import { body, param, query } from 'express-validator';
import {
  ISO_DATE_REGEX,
  TASK_PRIORITIES,
  TASK_SORTABLE_FIELDS,
  TASK_STATUSES,
} from '@/constants/task.constants';

const optionalTaskFields = [
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
  body('dueTime').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
  body('priority').optional().isIn([...TASK_PRIORITIES]).withMessage('invalid priority'),
  body('status').optional().isIn([...TASK_STATUSES]).withMessage('invalid status'),
  body('tag').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
  body('date')
    .optional()
    .matches(ISO_DATE_REGEX)
    .withMessage('date must be in YYYY-MM-DD format'),
];

export const createTaskValidator = [
  body('title')
    .exists({ values: 'falsy' })
    .withMessage('title is required')
    .bail()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 }),
  ...optionalTaskFields,
];

export const updateTaskValidator = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  ...optionalTaskFields,
];

export const statusTaskValidator = [
  body('status')
    .exists({ values: 'falsy' })
    .withMessage('status is required')
    .bail()
    .isIn([...TASK_STATUSES])
    .withMessage('invalid status'),
];

export const taskIdValidator = [param('id').isMongoId().withMessage('invalid task id')];

export const listTasksValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100').toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn([...TASK_STATUSES]).withMessage('invalid status'),
  query('priority').optional().isIn([...TASK_PRIORITIES]).withMessage('invalid priority'),
  query('date').optional().matches(ISO_DATE_REGEX).withMessage('date must be YYYY-MM-DD'),
  query('sortBy').optional().isIn([...TASK_SORTABLE_FIELDS]).withMessage('invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];