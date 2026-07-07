import { body, param } from 'express-validator';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const createBoardValidator = [
  body('title')
    .exists({ values: 'falsy' })
    .withMessage('title is required')
    .bail()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 }),
  body('boardDate')
    .exists({ values: 'falsy' })
    .withMessage('boardDate is required')
    .bail()
    .matches(ISO_DATE_REGEX)
    .withMessage('boardDate must be YYYY-MM-DD'),
];

export const updateBoardValidator = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('boardDate').optional().matches(ISO_DATE_REGEX).withMessage('boardDate must be YYYY-MM-DD'),
  body('snapshot').optional().isObject().withMessage('snapshot must be an object'),
  body('thumbnail').optional({ values: 'null' }).isString().withMessage('thumbnail must be a string'),
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) throw new Error('Provide at least one field to update');
    return true;
  }),
];

export const boardIdValidator = [param('id').isMongoId().withMessage('invalid board id')];