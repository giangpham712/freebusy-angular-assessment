import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from 'calendar-utils';
import { CalendarEventValidationHelper } from './calendar-event-validation-helper.provider';

describe('CalendarEventValidationHelper', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  let validationHelper: CalendarEventValidationHelper;
  beforeEach(() => {
    const existingEvents = [
      {
        title: '',
        start: new Date('2022-10-08T10:30:00'),
        end: new Date('2022-10-08T14:45:00'),
      },
      {
        title: '',
        start: new Date('2022-10-09T12:15:00'),
        end: new Date('2022-10-09T15:00:00'),
      },
      {
        title: '',
        start: new Date('2022-10-09T15:15:00'),
        end: new Date('2022-10-09T16:45:00'),
      },
    ];
    validationHelper = new CalendarEventValidationHelper(existingEvents);
  });

  it('validateCreate should return true if new event is valid', () => {
    const event = {
      title: '',
      start: new Date('2022-10-09T10:15:00'),
      end: new Date('2022-10-09T11:45:00'),
    };

    expect(validationHelper.validateCreate(event)).toBe(true);
  });

  it("validateCreate should return false if new event's start time and end time are on different days", () => {
    const event = {
      title: '',
      start: new Date('2022-10-09T10:15:00'),
      end: new Date('2022-10-10T12:45:00'),
    };

    expect(validationHelper.validateCreate(event)).toBe(false);
  });

  it('validateCreate should return false if new event overlaps with an existing event', () => {
    const event = {
      title: '',
      start: new Date('2022-10-09T10:15:00'),
      end: new Date('2022-10-09T12:45:00'),
    };

    expect(validationHelper.validateCreate(event)).toBe(false);
  });

  it(`validateUpdate should return false if event's new start time and end time are on different days`, () => {
    const event = {
      title: '',
      start: new Date('2022-10-09T10:15:00'),
      end: new Date('2022-10-09T12:45:00'),
    };

    expect(validationHelper.validateUpdate(event, new Date('2022-10-09T10:15:00'), new Date('2022-10-10:15:00'))).toBe(
      false,
    );
  });

  it(`validateUpdate should return false if event's new times overlaps with another existing event`, () => {
    const event = {
      title: '',
      start: new Date('2022-10-09T10:15:00'),
      end: new Date('2022-10-09T12:45:00'),
    };

    expect(validationHelper.validateUpdate(event, new Date('2022-10-09T10:15:00'), new Date('2022-10-09:15:00'))).toBe(
      false,
    );
  });

  it(`validateUpdate should return false if event's new times are on a different day than original times`, () => {
    const event = {
      title: '',
      start: new Date('2022-10-09T10:15:00'),
      end: new Date('2022-10-09T12:45:00'),
    };

    expect(validationHelper.validateUpdate(event, new Date('2022-10-12T10:15:00'), new Date('2022-10-12:15:00'))).toBe(
      false,
    );
  });
});
