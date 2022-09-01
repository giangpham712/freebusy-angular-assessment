import { CalendarEvent } from 'calendar-utils';
import { ceilToNearest, checkOverlapping, floorToNearest, getMinutesInDay } from './utils';

describe('Utils', () => {
  describe('floorToNearest should round number down to nearest interval', function () {
    const testCases = [
      [110, 30, 90],
      [150, 60, 120],
      [62, 15, 60],
      [1234, 123, 1230],
    ];

    testCases.forEach(([value, interval, expected]) => {
      it(`should round ${value} by ${interval} up to ${expected}`, function () {
        expect(floorToNearest(value, interval)).toBe(expected);
      });
    });
  });

  describe('ceilToNearest should round number up to nearest interval', function () {
    const testCases = [
      [1500, 200, 1600],
      [150, 60, 180],
      [1234, 57, 1254],
    ];

    testCases.forEach(([value, interval, expected]) => {
      it(`should round ${value} by ${interval} up to ${expected}`, function () {
        expect(ceilToNearest(value, interval)).toBe(expected);
      });
    });
  });

  describe('checkOverlapping should ', function () {
    const event = {
      start: new Date(2022, 10, 10, 10, 15, 0),
      end: new Date(2022, 10, 10, 12, 15, 0),
    } as CalendarEvent;

    const otherEventsWithOverlap = [
      {
        start: new Date(2022, 10, 10, 11, 30, 0),
        end: new Date(2022, 10, 10, 13, 45, 0),
      } as CalendarEvent,
    ];

    const otherEventsWithNoOverlap = [
      {
        start: new Date(2022, 10, 10, 12, 15, 0),
        end: new Date(2022, 10, 10, 14, 15, 0),
      } as CalendarEvent,
    ];

    it(`should return true when there is an overlap`, function () {
      expect(checkOverlapping(event, otherEventsWithOverlap)).toBeTrue();
    });

    it(`should return false when there is no overlap`, function () {
      expect(checkOverlapping(event, otherEventsWithNoOverlap)).toBeFalse();
    });
  });

  describe('getMinutesInDay should return correct number of minutes in day for a given date', function () {
    const testCases: [date: Date, minutes: number][] = [
      [new Date(2022, 12, 12, 9, 15, 0), 555],
      [new Date(2022, 12, 12, 12, 20, 0), 740],
      [new Date(2022, 12, 12, 7, 30, 0), 450],
    ];

    testCases.forEach(([date, minutes]) => {
      it(`should return ${minutes} for ${date.toLocaleString()}`, function () {
        expect(getMinutesInDay(date)).toBe(minutes);
      });
    });
  });
});
