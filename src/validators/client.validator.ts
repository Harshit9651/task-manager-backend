// src/validators/client.validator.ts
import { body, param } from 'express-validator';
import {
  DOCUMENT_CATEGORIES, INVOICE_STATUSES, ONBOARDING_STEP_KEYS, CLIENT_STATUSES,
} from '@/constants/client.constants';

export const clientIdValidator = [param('id').isMongoId().withMessage('invalid client id')];

export const updateClientValidator = [
  body('finalBudget').optional().isFloat({ min: 0 }).withMessage('finalBudget must be a positive number').toFloat(),
  body('currency').optional().isString().trim().isLength({ min: 1, max: 8 }),
  body('requirements').optional().isString().isLength({ max: 20000 }),
  body('updatedRequirements').optional().isString().isLength({ max: 20000 }),
  body('status').optional().isIn([...CLIENT_STATUSES]).withMessage('invalid status'),
  body('contact').optional().isObject(),
  body('contact.email').optional().isEmail().withMessage('invalid email'),
  body('contact.company').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('contact.contactName').optional().isString().trim().isLength({ min: 1, max: 150 }),
];

export const onboardingValidator = [
  body('key').exists().withMessage('key is required').bail().isIn([...ONBOARDING_STEP_KEYS]).withMessage('invalid step key'),
  body('done').exists().withMessage('done is required').bail().isBoolean().withMessage('done must be a boolean').toBoolean(),
];

export const createInvoiceValidator = [
  body('title').exists({ values: 'falsy' }).withMessage('title is required').bail().isString().trim().isLength({ min: 1, max: 200 }),
  body('amount').optional().isFloat({ min: 0 }).toFloat(),
  body('currency').optional().isString().trim().isLength({ min: 1, max: 8 }),
  body('status').optional().isIn([...INVOICE_STATUSES]).withMessage('invalid status'),
  body('source').optional().isIn(['created', 'uploaded']).withMessage('invalid source'),
  body('dueDate').optional({ values: 'null' }).isISO8601().toDate(),
];

export const invoiceStatusValidator = [
  body('status').exists().withMessage('status is required').bail().isIn([...INVOICE_STATUSES]).withMessage('invalid status'),
];

export const invoiceIdValidator = [param('invId').isMongoId().withMessage('invalid invoice id')];
export const documentIdValidator = [param('docId').isMongoId().withMessage('invalid document id')];

export const uploadDocumentValidator = [
  body('category').optional().isIn([...DOCUMENT_CATEGORIES]).withMessage('invalid category'),
  body('name').optional().isString().trim().isLength({ max: 200 }),
];