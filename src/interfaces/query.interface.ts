export interface QueryString {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  search?: string;
  [key: string]: unknown;
}