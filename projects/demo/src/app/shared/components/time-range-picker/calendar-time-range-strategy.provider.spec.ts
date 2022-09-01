import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from 'calendar-utils';
import { CalendarTimeRangeStrategy } from './calendar-time-range-strategy.provider';
import { CalendarEventTimes, TimeRange } from './types';

describe('CalendarTimeRangeStrategy', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  let strategy: CalendarTimeRangeStrategy;
  beforeEach(() => {
    strategy = new CalendarTimeRangeStrategy();
  });

  it('fromCalendarEventTimes should create timetable time range for the given calendar event times', () => {
    const eventTimes = {
      start: new Date(2022, 8, 20, 10, 30, 0),
      end: new Date(2022, 8, 20, 15, 15, 0),
    } as CalendarEventTimes;

    const timeRange = strategy.fromCalendarEventTimes(eventTimes);

    expect(timeRange.startTime).toBe(eventTimes.start);
    expect(timeRange.endTime).toBe(eventTimes.end);
  });

  it('toCalendarEventTimes should create calendar event times for the given time range', () => {
    const timeRange = {} as TimeRange;

    const event = strategy.toCalendarEventTimes(timeRange);
  });
});
