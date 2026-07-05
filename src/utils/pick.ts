export const pick = (source: unknown, keys: readonly string[]): Record<string, unknown> => {
  const obj = source && typeof source === 'object' ? (source as Record<string, unknown>) : {};
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};