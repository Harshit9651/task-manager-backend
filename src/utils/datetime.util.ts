export const getTodayInTimezone = (timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());


export const formatDateInTimezone = (date: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(date);


export const dateOffsetInTimezone = (days: number, timeZone: string): string =>
  formatDateInTimezone(new Date(Date.now() + days * 86_400_000), timeZone);


export const formatTimeInTimezone = (date: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true })
    .format(date);


export const formatLongDate = (date: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);


export const formatShortDate = (date: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short' }).format(date);