import { Injectable } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';
import { addMinutes, format } from 'date-fns';
import * as uuid from 'uuid';

@Injectable()
export class CalendarEventBuilder {
  private event: CalendarEvent;

  constructor() {
    this.reset();
  }

  public from(event: CalendarEvent): CalendarEventBuilder {
    this.event = event;
    return this;
  }

  public reset(): CalendarEventBuilder {
    this.event = {
      id: uuid.v4(),
      title: '',
      start: new Date(),
      end: new Date(),
      draggable: true,
      actions: [],
    };

    return this;
  }

  public withStartTime(start: Date): CalendarEventBuilder {
    this.event.start = start;
    return this;
  }

  public withEndTime(end: Date): CalendarEventBuilder {
    this.event.end = end;
    return this;
  }

  public withVariableDuration(): CalendarEventBuilder {
    this.event.resizable = {
      beforeStart: true,
      afterEnd: true,
    };

    return this;
  }

  public onDelete(onDelete: ({ event: CalendarEvent }) => void): CalendarEventBuilder {
    let deleteAction = this.event.actions.find(x => x.id === 'delete');
    if (!deleteAction) {
      deleteAction = {
        id: 'delete',
        label: '<span class="cal-event-delete"><i class="bi bi-x-circle-fill"></i></span>',
        onClick: onDelete,
      };

      this.event.actions.push(deleteAction);
    } else {
      deleteAction.onClick = onDelete;
    }

    return this;
  }

  public withFixedDuration(duration: number): CalendarEventBuilder {
    this.event.end = addMinutes(this.event.start, duration);

    return this;
  }

  public build(): CalendarEvent {
    return this.event;
  }
}
