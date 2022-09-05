import { CalendarEvent } from 'calendar-utils';
import { differenceInMinutes, startOfDay } from 'date-fns';

/**
 * Round a number up to the nearest interval
 */
export const floorToNearest = (value: number, interval: number) => {
  return Math.floor(value / interval) * interval;
};

/**
 * Round a number down to the nearest interval
 */
export const ceilToNearest = (value: number, interval: number) => {
  return Math.ceil(value / interval) * interval;
};

/**
 * Check whether an event overlaps with any of the other events
 */
export const checkOverlapping = (event: CalendarEvent, otherEvents: CalendarEvent[]): boolean => {
  return !!otherEvents.find(otherEvent => {
    return (
      otherEvent.end &&
      event.end &&
      ((otherEvent.start < event.start && event.start < otherEvent.end) ||
        (otherEvent.start < event.end && event.start < otherEvent.end))
    );
  });
};

/**
 * Get the number of minutes in day for a given date
 */
export const getMinutesInDay = (date: Date): number => {
  if (!date) {
    return 0;
  }

  return differenceInMinutes(date, startOfDay(date));
};
