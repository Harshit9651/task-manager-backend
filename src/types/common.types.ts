export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  results: T[];
  meta: PaginationMeta;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: unknown;
}


export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firebaseUid?: string;
}