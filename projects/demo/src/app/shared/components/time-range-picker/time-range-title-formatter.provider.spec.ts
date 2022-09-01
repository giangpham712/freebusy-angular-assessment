import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from 'calendar-utils';
import { CalendarTimeRangeStrategy } from './calendar-time-range-strategy.provider';
import { TimeRangeTitleFormatter } from './time-range-title-formatter.provider';
import { CalendarEventTimes, TimeRange } from './types';

describe('TimeRangeTitleFormatter', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  let formatter: TimeRangeTitleFormatter;
  beforeEach(() => {
    formatter = new TimeRangeTitleFormatter('en');
  });

  it('week should format calendar event title correctly', () => {
    const event = {
      title: '',
      start: new Date(2022, 8, 20, 10, 30, 0),
      end: new Date(2022, 8, 20, 15, 15, 0),
    };

    const title = formatter.week(event);

    expect(title).toBe('10:30 AM - 3:15 PM');
  });
});
