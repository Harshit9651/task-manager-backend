import { body } from 'express-validator';

export const googleLoginValidator = [
  body('idToken')
    .exists({ checkFalsy: true })
    .withMessage('idToken is required')
    .bail()
    .isString()
    .withMessage('idToken must be a string')
    .isLength({ min: 20 })
    .withMessage('idToken appears to be invalid'),
];