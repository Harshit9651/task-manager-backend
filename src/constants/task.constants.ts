export const TASK_STATUSES = ['pending', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_DEFAULTS = {
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  tag: 'Outreach',
};

export const TASK_SEARCHABLE_FIELDS = ['title', 'description', 'tag'] as const;

export const TASK_SORTABLE_FIELDS = ['date', 'createdAt', 'priority', 'title'] as const;

export const TASK_CREATABLE_FIELDS = [
  'title',
  'description',
  'dueTime',
  'priority',
  'tag',
  'status',
  'date',
] as const;

export const TASK_UPDATABLE_FIELDS = [...TASK_CREATABLE_FIELDS] as const;

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const todayISODate = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};