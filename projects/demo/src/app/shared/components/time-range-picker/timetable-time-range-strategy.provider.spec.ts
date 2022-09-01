import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from 'calendar-utils';
import { startOfWeek } from 'date-fns';
import { TimetableTimeRangeStrategy } from './timetable-time-range-strategy.provider';
import { DayOfWeek, TimeRange } from './types';

describe('TimetableTimeRangeStrategy', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  let strategy: TimetableTimeRangeStrategy;
  beforeEach(() => {
    strategy = new TimetableTimeRangeStrategy(startOfWeek(new Date()));
  });

  it('fromCalendarEventTimes should create timetable time range for the given calendar event times', () => {
    const eventTimes = {
      start: new Date(2022, 8, 20, 10, 30, 0),
      end: new Date(2022, 8, 20, 15, 15, 0),
    };

    const timeRange = strategy.fromCalendarEventTimes(eventTimes);

    expect(timeRange.startTimeInMinutes).toBe(630);
    expect(timeRange.endTimeInMinutes).toBe(915);
    expect(timeRange.startDay).toBe(DayOfWeek.Tuesday);
  });

  it('toCalendarEventTimes should create calendar event times for the given time range', () => {
    const timeRange = {} as TimeRange;

    const eventTimes = strategy.toCalendarEventTimes(timeRange);
  });
});
