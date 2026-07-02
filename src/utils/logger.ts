
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const format = (level: LogLevel, args: unknown[]): unknown[] => {
  const stamp = new Date().toISOString();
  return [`[${stamp}] [${level}]`, ...args];
};

export const logger = {
  info: (...args: unknown[]): void => console.log(...format('INFO', args)),
  warn: (...args: unknown[]): void => console.warn(...format('WARN', args)),
  error: (...args: unknown[]): void => console.error(...format('ERROR', args)),
  debug: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...format('DEBUG', args));
    }
  },
};