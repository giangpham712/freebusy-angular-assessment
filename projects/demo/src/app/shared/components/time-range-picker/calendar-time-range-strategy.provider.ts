import { InjectionToken } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';
import { TimeRangeStrategy } from './time-range-strategy.interface';
import { CalendarEventTimes, TimeRange } from './types';

export const CALENDAR_TIME_RANGE_STRATEGY = new InjectionToken<TimeRangeStrategy>('calendarTimeRange');

export class CalendarTimeRangeStrategy implements TimeRangeStrategy {
  public fromCalendarEventTimes({ start, end }: CalendarEventTimes): TimeRange {
    return {
      startTime: start,
      endTime: end,
    };
  }

  public toCalendarEventTimes(timeRange: TimeRange): CalendarEventTimes {
    return {
      start: timeRange.startTime,
      end: timeRange.endTime,
    };
  }
}
