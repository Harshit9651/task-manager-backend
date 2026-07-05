import { body, param, query } from 'express-validator';
import {
  COMPANY_SIZES,
  LEAD_SORTABLE_FIELDS,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
} from '@/constants/lead.constants';

const PHONE_PATTERN = /^[+]?[\d\s().-]+$/;

const normalizeTags = (tags: unknown): unknown =>
  Array.isArray(tags)
    ? [...new Set(tags.map((t) => String(t).trim()).filter(Boolean))]
    : tags;


const optionalLeadFields = [
  body('designation').optional({ values: 'falsy' }).isString().trim().isLength({ max: 150 }),
  body('phone')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ min: 5, max: 30 })
    .matches(PHONE_PATTERN)
    .withMessage('phone contains invalid characters'),
  body('linkedin')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isURL({ require_protocol: false })
    .withMessage('linkedin must be a valid URL'),
  body('website')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isURL({ require_protocol: false })
    .withMessage('website must be a valid URL'),
  body('country').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }),
  body('city').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }),

  // Enums that must always hold a value are NOT nullable.
  body('source').optional().isIn([...LEAD_SOURCES]).withMessage('invalid source'),
  body('temperature').optional().isIn([...LEAD_TEMPERATURES]).withMessage('invalid temperature'),
  body('status').optional().isIn([...LEAD_STATUSES]).withMessage('invalid status'),

  // companySize is genuinely optional -> nullable so it can be cleared.
  body('companySize')
    .optional({ values: 'falsy' })
    .isIn([...COMPANY_SIZES])
    .withMessage('invalid companySize'),

  body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 5000 }),

  body('tags').optional().isArray().withMessage('tags must be an array').customSanitizer(normalizeTags),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('each tag must be a string')
    .isLength({ max: 40 })
    .withMessage('each tag must be at most 40 characters'),
];

export const createLeadValidator = [
  body('company')
    .exists({ values: 'falsy' })
    .withMessage('company is required')
    .bail()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 }),
  body('contactName')
    .exists({ values: 'falsy' })
    .withMessage('contactName is required')
    .bail()
    .isString()
    .trim()
    .isLength({ min: 1, max: 150 }),
  body('email')
    .exists({ values: 'falsy' })
    .withMessage('email is required')
    .bail()
    .isEmail()
    .withMessage('email must be valid'),
  ...optionalLeadFields,
];

export const updateLeadValidator = [
  body('company').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('contactName').optional().isString().trim().isLength({ min: 1, max: 150 }),
  body('email').optional().isEmail().withMessage('email must be valid'),
  ...optionalLeadFields,
  body('lastContactedAt')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('lastContactedAt must be a valid date')
    .toDate(),
  body('nextFollowUp')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('nextFollowUp must be a valid date')
    .toDate(),
];

export const leadIdValidator = [param('id').isMongoId().withMessage('invalid lead id')];

export const listLeadsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn([...LEAD_STATUSES]).withMessage('invalid status'),
  query('temperature').optional().isIn([...LEAD_TEMPERATURES]).withMessage('invalid temperature'),
  query('source').optional().isIn([...LEAD_SOURCES]).withMessage('invalid source'),
  query('companySize').optional().isIn([...COMPANY_SIZES]).withMessage('invalid companySize'),
  query('sortBy').optional().isIn([...LEAD_SORTABLE_FIELDS]).withMessage('invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
  query('isArchived').optional().isIn(['true', 'false']).withMessage('isArchived must be true or false'),
];


export const updateLeadStatusValidator = [
  body("status")
    .exists({ values: "falsy" })
    .withMessage("status is required")
    .bail()
    .isIn([...LEAD_STATUSES])
    .withMessage("invalid status"),
];

export const updateLeadFollowUpValidator = [
  body("nextFollowUp")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("nextFollowUp must be a valid date")
    .toDate(),
];