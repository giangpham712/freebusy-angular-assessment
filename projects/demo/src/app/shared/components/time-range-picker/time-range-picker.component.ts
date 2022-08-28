import { ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
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

export interface TimeRange {
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
  PickerMode = PickerMode;

  destroySource = new Subject<boolean>();

  @Input()
  mode: PickerMode = PickerMode.Calendar;

  @Input()
  timeRangeGridSize: GridSize = 15;

  @Input()
  timeRangeFixedDuration: number | null = null;

  @Input()
  maxTimesPerDay: number | null = null;

  @Input()
  set timeRanges(timeRanges: TimeRange[]) {
    this.timeRangesSource.next(timeRanges);
  }

  @Output()
  timeRangeCreate = new EventEmitter<{ created: TimeRange }>();

  @Output()
  timeRangeDelete = new EventEmitter<{ deleted: TimeRange }>();

  @Output()
  timeRangeUpdate = new EventEmitter<{ updated: TimeRange; original: TimeRange }>();

  viewDate = new Date();

  weekStartsOn: 0 = 0;

  timeRangesSource: BehaviorSubject<TimeRange[]> = new BehaviorSubject<TimeRange[]>([]);
  eventFromDragSource = new BehaviorSubject<CalendarEvent>(null);

  eventsSources = new BehaviorSubject<CalendarEvent[]>([]);
  events$: Observable<CalendarEvent[]> = this.eventsSources.asObservable();

  constructor() {}

  ngOnInit(): void {
    combineLatest([this.timeRangesSource, this.eventFromDragSource])
      .pipe(
        takeUntil(this.destroySource),
        map(([timeRanges, eventFromDrag]) => {
          return [...timeRanges.map(t => this.timeRangeToEvent(t)), ...(eventFromDrag ? [eventFromDrag] : [])];
        }),
        tap(events => {
          this.eventsSources.next(events);
        }),
      )
      .subscribe();
  }

  get timeRanges() {
    return this.timeRangesSource.value;
  }

  get hourSegments() {
    return 60 / this.timeRangeGridSize;
  }

  get eventFromDrag() {
    return this.eventFromDragSource.value;
  }

  get events() {
    return this.eventsSources.value;
  }

  private timeRangeToEvent(timeRange: TimeRange): CalendarEvent {
    const { title, start, end } = timeRange;
    const event = this.createEvent({
      id: uuid.v4(),
      title: title || `${format(start, 'p')} - ${format(end, 'p')}`,
      start,
      end,
      canDelete: true,
      canResize: !this.timeRangeFixedDuration,
    });

    event.meta.timeRange = timeRange;
    return event;
  }

  private eventToTimeRange(event: CalendarEvent): TimeRange {
    return {} as TimeRange;
  }

  onMouseDown(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    if (this.timeRangeFixedDuration) {
      this.onEventCreated({
        event: this.createEvent({
          title: 'New event',
          start: segment.date,
          end: addMinutes(segment.date, this.timeRangeFixedDuration),
        }),
      });

      return;
    }

    this.startDragToCreate(segment, mouseDownEvent, segmentElement);
  }

  onEventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent) {
    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd,
    };

    const timeRange = event.meta.timeRange;

    if (timeRange && this.validateUpdatedEvent(updatedEvent, event)) {
      this.timeRangeUpdate.next({
        updated: {
          ...timeRange,
          start: newStart,
          end: newEnd,
        },
        original: timeRange,
      });
    }
  }

  private startDragToCreate(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    const eventFromDrag = {
      id: this.events.length,
      title: 'New event',
      start: segment.date,
      end: addMinutes(segment.date, this.timeRangeGridSize),
      meta: {},
    };

    this.eventFromDragSource.next(eventFromDrag);

    const segmentPosition = segmentElement.getBoundingClientRect();

    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        finalize(() => {
          if (this.eventFromDrag) {
            this.onEventCreated({ event: this.eventFromDrag });

            this.eventFromDragSource.next(null);
          }
        }),
        takeUntil(fromEvent(document, 'mouseup')),
      )
      .subscribe((mouseMoveEvent: MouseEvent) => {
        const minutesDiff = ceilToNearest(mouseMoveEvent.clientY - segmentPosition.top, this.timeRangeGridSize);

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
    if (this.validateCreatedEvent(event)) {
      const { start, end } = event;
      this.timeRangeCreate.next({
        created: {
          start,
          end,
        },
      });
    }
  }

  private onEventDeleted({ event }: { event: CalendarEvent }): void {
    const timeRange = event.meta?.timeRange;
    if (timeRange) {
      this.timeRangeDelete.next({ deleted: timeRange });
    }
  }
  private validateCreatedEvent = (event: CalendarEvent): event is CalendarEvent & { end: Date } => {
    // don't allow dragging or resizing events to different days
    const { start, end } = event;
    if (!end) {
      return false;
    }

    if (!isSameDay(start, end)) {
      return false;
    }

    // don't allow dragging events to the same times as other events
    if (this.checkOverlapping(event)) {
      return false;
    }

    return true;
  };

  private createEvent({
    id,
    title,
    start,
    end,
    canResize,
    canDelete,
  }: {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    canResize?: boolean;
    canDelete?: boolean;
  }): CalendarEvent {
    const actions: CalendarEventAction[] = [];

    if (canDelete)
      actions.push({
        label: '<span class="cal-event-delete"><i class="bi bi-x-circle-fill"></i></span>',
        onClick: ({ event }) => this.onEventDeleted({ event }),
      });

    return {
      id,
      title,
      start,
      end,
      meta: {},
      draggable: true,
      resizable: canResize
        ? {
            beforeStart: true,
            afterEnd: true,
          }
        : null,
      actions,
    };
  }

  private validateUpdatedEvent = (
    event: CalendarEvent,
    before: CalendarEvent,
  ): event is CalendarEvent & { end: Date } => {
    // don't allow dragging or resizing events to different days
    const { start, end } = event;
    if (!end) {
      return false;
    }

    if (!isSameDay(start, end)) {
      return false;
    }

    if (!isSameDay(event.start, before.start)) {
      return false;
    }

    // don't allow dragging events to the same times as other events
    if (this.checkOverlapping(event)) {
      return false;
    }

    return true;
  };

  private checkOverlapping = (event: CalendarEvent) => {
    return this.events.find(otherEvent => {
      return (
        otherEvent.id !== event.id &&
        !otherEvent.allDay &&
        !!otherEvent.end &&
        !!event.end &&
        ((otherEvent.start < event.start && event.start < otherEvent.end) ||
          (otherEvent.start < event.end && event.start < otherEvent.end))
      );
    });
  };

  ngOnDestroy() {
    this.destroySource.next(true);
    this.destroySource.complete();
  }
}
