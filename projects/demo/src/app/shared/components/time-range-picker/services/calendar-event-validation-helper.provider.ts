import { CalendarEvent } from 'calendar-utils';
import { isSameDay } from 'date-fns';
import { checkOverlapping } from '../utils';

export class CalendarEventValidationHelper {
  constructor(private events: CalendarEvent[]) {}

  public validateCreate(event: CalendarEvent) {
    const { start, end } = event;
    if (!end) {
      return false;
    }

    if (!isSameDay(start, end)) {
      return false;
    }

    const otherEvents = this.events.filter(x => (!x.id && !event.id) || x.id !== event.id);
    if (checkOverlapping(event, otherEvents)) {
      return false;
    }

    return true;
  }

  public validateUpdate = (
    event: CalendarEvent,
    newStart: Date,
    newEnd: Date,
  ): event is CalendarEvent & { end: Date } => {
    // don't allow dragging or resizing events to different days

    if (!newEnd) {
      return false;
    }

    if (!isSameDay(newStart, newEnd)) {
      return false;
    }

    if (!isSameDay(event.start, newStart)) {
      return false;
    }

    const otherEvents = this.events.filter(x => (!x.id && !event.id) || x.id !== event.id);
    if (checkOverlapping({ ...event, start: newStart, end: newEnd }, otherEvents)) {
      return false;
    }

    return true;
  };
}
