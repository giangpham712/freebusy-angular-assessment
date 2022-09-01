import { CalendarEvent } from 'calendar-utils';

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export type CalendarEventTimes = Pick<CalendarEvent, 'start' | 'end'>;

export interface TimeRange {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  startDay?: DayOfWeek;
  startTimeInMinutes?: number;
  endTimeInMinutes?: number;
}

export enum PickerMode {
  Calendar = 'calendar',
  Timetable = 'timetable',
}

export type GridSize = 15 | 30 | 60;

export interface TimeRangeCreatedEvent {
  created: TimeRange;
}

export interface TimeRangeUpdatedEvent {
  updated: TimeRange;
  original: TimeRange;
}

export interface TimeRangeDeletedEvent {
  deleted: TimeRange;
}
