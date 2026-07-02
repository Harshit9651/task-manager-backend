export const MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  RESTORED: 'Restored successfully',
  FETCHED: 'Fetched successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Something went wrong',
} as const;

export type MessageKey = keyof typeof MESSAGES;