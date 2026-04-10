import { format, parseISO, isToday as _isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export function toDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateString(dateStr: string): Date {
  return parseISO(dateStr)
}

export function formatDisplay(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE, MMM d')
}

export function formatFull(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')
}

export function isToday(dateStr: string): boolean {
  return _isToday(parseISO(dateStr))
}

/** Returns 0=Sunday, 1=Monday, ..., 6=Saturday */
export function getDayOfWeek(date: Date = new Date()): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export function getTodayString(): string {
  return toDateString(new Date())
}

export function getWeekDates(date: Date = new Date()): string[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(toDateString)
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_FULL_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
