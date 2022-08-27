import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CalendarEvent, WeekViewHourSegment } from 'calendar-utils';
import { addDays, addMinutes, endOfWeek, isSameDay } from 'date-fns';
import { CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';

function floorToNearest(amount: number, precision: number) {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number) {
  return Math.ceil(amount / precision) * precision;
}

const createEvent = ({
  id,
  title,
  start,
  end,
  onDelete,
}: {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  onDelete?: ({ event }: { event: CalendarEvent }) => void;
}): CalendarEvent => {
  const actions: CalendarEventAction[] = [];
  if (onDelete)
    actions.push({
      label: '<span>Delete</span>',
      onClick: onDelete,
    });

  return {
    id,
    title,
    start,
    end,
    meta: {
      tmpEvent: true,
    },
    draggable: true,
    resizable: {
      beforeStart: true,
      afterEnd: true,
    },
    actions,
  };
};

export interface Time {
  hour: number;
  minute: number;
}

export interface TimeRange {
  id?: string;
  title?: string;
  description?: string;
  start: Date;
  end: Date;
}

export enum PickerMode {
  Calendar = 'calendar',
  Timetable = 'timetable',
}

export type GridSize = 15 | 30 | 60;

@Component({
  selector: 'app-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeRangePickerComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef) {}

  @Input()
  mode: PickerMode = PickerMode.Calendar;

  @Input()
  timeGridSize: GridSize = 15;

  @Input()
  times: TimeRange[] = [];

  @Input()
  fixedTimeDuration: number | null = null;

  @Output()
  timeSelect = new EventEmitter<TimeRange>();

  @Output()
  timeDelete = new EventEmitter<TimeRange>();

  @Output()
  timeUpdate = new EventEmitter<TimeRange>();

  PickerMode = PickerMode;

  events: CalendarEvent[] = [];

  ngOnInit(): void {
    this.mapTimesToEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['times']) {
      this.mapTimesToEvents();
    }
  }

  viewDate = new Date();

  dragToCreateActive = false;

  weekStartsOn: 0 = 0;

  dragToSelectEvent: CalendarEvent | null = null;

  get hourSegments() {
    return 60 / this.timeGridSize;
  }

  private mapTimesToEvents() {
    this.events = this.times.map(x => {
      const { id, title, start, end } = x;
      return createEvent({
        id,
        title: title || '',
        start,
        end,
        onDelete: ({ event }) => this.onEventDeleted({ event }),
      });
    });
  }

  validateTime = (event: CalendarEvent): event is CalendarEvent & { end: Date } => {
    // don't allow dragging or resizing events to different days
    const { start, end } = event;
    if (!end) {
      return false;
    }

    const sameDay = isSameDay(start, end);

    if (!sameDay) {
      return false;
    }

    // don't allow dragging events to the same times as other events
    const overlappingEvent = this.events.find(otherEvent => {
      return (
        otherEvent !== event &&
        !otherEvent.allDay &&
        !!otherEvent.end &&
        !!event.end &&
        ((otherEvent.start < event.start && event.start < otherEvent.end) ||
          (otherEvent.start < event.end && event.start < otherEvent.end))
      );
    });

    if (overlappingEvent) {
      return false;
    }

    return true;
  };

  onMouseDown(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    if (this.fixedTimeDuration) {
      this.timeSelect.next({
        start: segment.date,
        end: addMinutes(segment.date, this.fixedTimeDuration),
      });

      return;
    }

    this.startDragToCreate(segment, mouseDownEvent, segmentElement);
  }

  startDragToCreate(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    this.dragToSelectEvent = {
      id: this.events.length,
      title: 'New event',
      start: segment.date,
      meta: {
        tmpEvent: true,
      },
    };

    this.events = [...this.events, this.dragToSelectEvent];

    const segmentPosition = segmentElement.getBoundingClientRect();
    this.dragToCreateActive = true;
    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        finalize(() => {
          console.log('Finalize');
          if (this.dragToSelectEvent) {
            delete this.dragToSelectEvent.meta.tmpEvent;
            this.dragToCreateActive = false;

            this.onEventCreated({ event: this.dragToSelectEvent });

            this.dragToSelectEvent = null;
            this.refresh();
          }
        }),
        takeUntil(fromEvent(document, 'mouseup')),
      )
      .subscribe((mouseMoveEvent: MouseEvent) => {
        console.log(mouseMoveEvent.clientY - segmentPosition.top);
        const minutesDiff = ceilToNearest(mouseMoveEvent.clientY - segmentPosition.top, this.timeGridSize);

        const daysDiff =
          floorToNearest(mouseMoveEvent.clientX - segmentPosition.left, segmentPosition.width) / segmentPosition.width;

        const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);
        if (this.dragToSelectEvent && newEnd > segment.date && newEnd < endOfView) {
          this.dragToSelectEvent.end = newEnd;
        }
        this.refresh();
      });
  }

  private onEventCreated({ event }: { event: CalendarEvent }) {
    if (this.validateTime(event)) {
      const { start, end } = event;
      this.timeSelect.next({
        start,
        end,
      });
    }
  }

  private onEventDeleted({ event }: { event: CalendarEvent }): void {
    const time = this.times.find(x => x.id === event.id);
    if (time) {
      this.timeDelete.next(time);
    }
  }

  onEventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent) {
    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd,
    };

    const time = this.times.find(x => x.id === event.id);

    if (time && this.validateTime(updatedEvent)) {
      this.timeUpdate.next(time);
    }
  }

  private refresh() {
    this.events = [...this.events];
    this.cdr.detectChanges();
  }
}
