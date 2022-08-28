import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import * as uuid from 'uuid';
import { format } from 'date-fns';
import { BehaviorSubject, combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
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
      label: '<span class="cal-event-delete"><i class="bi bi-x-circle-fill"></i></span>',
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
export class TimeRangePickerComponent implements OnInit, OnDestroy {
  destroySource = new Subject<boolean>();

  @Input()
  mode: PickerMode = PickerMode.Calendar;

  @Input()
  timeGridSize: GridSize = 15;

  @Input()
  set times(times: TimeRange[]) {
    this.timesSource.next(times);
  }

  @Input()
  timeFixedDuration: number | null = null;

  @Input()
  maxTimesPerDay: number | null = null;

  @Output()
  timeSelect = new EventEmitter<TimeRange>();

  @Output()
  timeDelete = new EventEmitter<TimeRange>();

  @Output()
  timeUpdate = new EventEmitter<TimeRange>();

  PickerMode = PickerMode;

  viewDate = new Date();

  weekStartsOn: 0 = 0;

  timesSource: BehaviorSubject<TimeRange[]> = new BehaviorSubject<TimeRange[]>([]);
  eventFromDragSource = new BehaviorSubject<CalendarEvent>(null);

  eventsSources = new BehaviorSubject<CalendarEvent[]>([]);
  events$: Observable<CalendarEvent[]> = this.eventsSources.asObservable();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    combineLatest([this.timesSource, this.eventFromDragSource])
      .pipe(
        takeUntil(this.destroySource),
        map(([times, eventFromDrag]) => {
          return [...times.map(t => this.timeToEvent(t)), ...(eventFromDrag ? [eventFromDrag] : [])];
        }),
        tap(events => {
          this.eventsSources.next(events);
        }),
      )
      .subscribe();
  }

  get times() {
    return this.timesSource.value;
  }

  get hourSegments() {
    return 60 / this.timeGridSize;
  }

  get eventFromDrag() {
    return this.eventFromDragSource.value;
  }

  get events() {
    return this.eventsSources.value;
  }

  private timeToEvent(time: TimeRange): CalendarEvent {
    const { id, title, start, end } = time;
    return createEvent({
      id,
      title: title || `${format(start, 'p')} - ${format(end, 'p')}`,
      start,
      end,
      onDelete: ({ event }) => this.onEventDeleted({ event }),
    });
  }

  private eventToTime(event: CalendarEvent): TimeRange {
    return {} as TimeRange;
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
        otherEvent.id !== event.id &&
        !otherEvent.allDay &&
        !!otherEvent.end &&
        !!event.end &&
        ((otherEvent.start < event.start && event.start < otherEvent.end) ||
          (otherEvent.start < event.end && event.start < otherEvent.end))
      );
    });

    console.log(overlappingEvent);

    if (overlappingEvent) {
      return false;
    }

    return true;
  };

  onMouseDown(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    if (this.timeFixedDuration) {
      this.onEventCreated({
        event: createEvent({
          title: 'New event',
          start: segment.date,
          end: addMinutes(segment.date, this.timeFixedDuration),
        }),
      });

      return;
    }

    this.startDragToCreate(segment, mouseDownEvent, segmentElement);
  }

  startDragToCreate(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    const eventFromDrag = {
      id: this.events.length,
      title: 'New event',
      start: segment.date,
      meta: {
        tmpEvent: true,
      },
    };

    this.eventFromDragSource.next(eventFromDrag);

    const segmentPosition = segmentElement.getBoundingClientRect();

    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        finalize(() => {
          console.log('Finalize');
          if (this.eventFromDrag) {
            delete this.eventFromDrag.meta.tmpEvent;

            this.onEventCreated({ event: this.eventFromDrag });

            this.eventFromDragSource.next(null);
          }
        }),
        takeUntil(fromEvent(document, 'mouseup')),
      )
      .subscribe((mouseMoveEvent: MouseEvent) => {
        const minutesDiff = ceilToNearest(mouseMoveEvent.clientY - segmentPosition.top, this.timeGridSize);

        const daysDiff =
          floorToNearest(mouseMoveEvent.clientX - segmentPosition.left, segmentPosition.width) / segmentPosition.width;

        const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);
        if (this.eventFromDrag && newEnd > segment.date && newEnd < endOfView) {
          this.eventFromDragSource.next({
            ...this.eventFromDrag,
            end: newEnd,
          });
        }
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
      this.timeUpdate.next({
        ...time,
        start: newStart,
        end: newEnd,
      });
    }
  }

  private refresh() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroySource.next(true);
    this.destroySource.complete();
  }
}
