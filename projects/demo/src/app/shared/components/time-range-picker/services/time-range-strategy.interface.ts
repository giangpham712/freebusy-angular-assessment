import { CalendarEventTimes, TimeRange } from '../types';

export interface TimeRangeStrategy {
  fromCalendarEventTimes(times: CalendarEventTimes): TimeRange;
  toCalendarEventTimes(timeRange: TimeRange): CalendarEventTimes;
}
