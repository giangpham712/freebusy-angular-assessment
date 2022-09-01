import { InjectionToken } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';
import { addDays, addMinutes, startOfWeek } from 'date-fns';
import { getDay } from 'date-fns/esm';
import { TimeRangeStrategy } from './time-range-strategy.interface';
import { CalendarEventTimes, TimeRange } from './types';
import { getMinutesInDay } from './utils';

export const TIMETABLE_TIME_RANGE_STRATEGY = new InjectionToken<TimeRangeStrategy>('');

export class TimetableTimeRangeStrategy implements TimeRangeStrategy {
  private weekStart: Date;

  constructor(weekStart: Date) {
    this.weekStart = startOfWeek(weekStart);
  }

  public fromCalendarEventTimes({ start, end }: CalendarEventTimes): TimeRange {
    return {
      startDay: getDay(start),
      startTimeInMinutes: getMinutesInDay(start),
      endTimeInMinutes: getMinutesInDay(end),
    };
  }

  public toCalendarEventTimes(timeRange: TimeRange): CalendarEventTimes {
    return {
      start: addMinutes(addDays(this.weekStart, timeRange.startDay), timeRange.startTimeInMinutes),
      end: addMinutes(addDays(this.weekStart, timeRange.startDay), timeRange.endTimeInMinutes),
    };
  }
}
