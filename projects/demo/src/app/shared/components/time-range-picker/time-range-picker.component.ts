import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  Injector,
} from '@angular/core';
import * as uuid from 'uuid';
import { startOfWeek } from 'date-fns';
import { BehaviorSubject, combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
import { CalendarEvent, WeekViewHourSegment } from 'calendar-utils';
import { addDays, addMinutes, endOfWeek, isSameDay } from 'date-fns';
import { CalendarEventTimesChangedEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import {
  GridSize,
  PickerMode,
  TimeRange,
  TimeRangeCreatedEvent,
  TimeRangeDeletedEvent,
  TimeRangeUpdatedEvent,
} from './types';
import { ceilToNearest, checkOverlapping, floorToNearest } from './utils';
import { TimetableTimeRangeStrategy } from './timetable-time-range-strategy.provider';
import { CalendarTimeRangeStrategy } from './calendar-time-range-strategy.provider';
import { TimeRangeStrategy } from './time-range-strategy.interface';
import { CalendarEventBuilder } from './calendar-event-builder.provider';
import { TimeRangeTitleFormatter } from './time-range-title-formatter.provider';

/**
 *
 */
@Component({
  selector: 'app-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: TimeRangeTitleFormatter,
    },
  ],
})
export class TimeRangePickerComponent implements OnInit, OnDestroy {
  PickerMode = PickerMode;

  private destroySource = new Subject<boolean>();
  private timeRangeStrategy: TimeRangeStrategy;

  /**
   * The mode of the picker to use. Available modes include Calendar and Timetable
   *
   */
  @Input()
  mode: PickerMode = PickerMode.Calendar;

  /**
   * The grid increment size in minutes. Possible values include 15, 30 and 60 minutes.
   */
  @Input()
  timeRangeGridSize: GridSize = 15;

  /**
   * The duration to fix for a time range.
   * If not provided, time ranges can have variable duration and can be resized by dragging.
   */
  @Input()
  timeRangeFixedDuration: number | null = null;

  /**
   * The initial time ranges
   */
  @Input()
  set timeRanges(timeRanges: TimeRange[]) {
    const initialEvents = [];
    this.timeRangeByEventId.clear();

    for (const timeRange of timeRanges) {
      const event = this.timeRangeToEvent(timeRange);
      console.log(event);
      initialEvents.push(event);
      this.timeRangeByEventId.set(event.id.toString(), timeRange);
    }

    this.initialEventsSources.next(initialEvents);
  }

  /**
   * Emitted when a valid time range is selected
   */
  @Output()
  timeRangeCreate = new EventEmitter<TimeRangeCreatedEvent>();

  /**
   * Emitted when a time range is deleted
   */
  @Output()
  timeRangeDelete = new EventEmitter<TimeRangeDeletedEvent>();

  /**
   * Emitted when there is some change to a time range
   */
  @Output()
  timeRangeUpdate = new EventEmitter<TimeRangeUpdatedEvent>(); //

  viewDate = new Date();

  weekStartsOn: 0 = 0;

  eventFromDragSource = new BehaviorSubject<CalendarEvent>(null);

  initialEventsSources = new BehaviorSubject<CalendarEvent[]>([]);

  timeRangeByEventId: Map<string, TimeRange> = new Map<string, TimeRange>();

  eventsSources = new BehaviorSubject<CalendarEvent[]>([]);

  events$: Observable<CalendarEvent[]> = this.eventsSources.asObservable();

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.timeRangeStrategy = this.getTimeRangeStrategy();

    combineLatest([this.initialEventsSources, this.eventFromDragSource])
      .pipe(
        takeUntil(this.destroySource),
        map(([initialEvents, eventFromDrag]) => {
          return [...initialEvents, ...(eventFromDrag ? [eventFromDrag] : [])];
        }),
        tap(events => {
          this.eventsSources.next(events);
        }),
      )
      .subscribe();
  }

  get segmentsPerHour() {
    return 60 / this.timeRangeGridSize;
  }

  get eventFromDrag() {
    return this.eventFromDragSource.value;
  }

  get events() {
    return this.eventsSources.value;
  }

  private timeRangeToEvent(timeRange: TimeRange): CalendarEvent {
    const { start, end } = this.timeRangeStrategy.toCalendarEventTimes(timeRange);
    let calendarEventBuilder = this.injector.get(CalendarEventBuilder);

    return calendarEventBuilder
      .reset()
      .withStartTime(start)
      .withEndTime(end)
      .onDelete(this.onEventDeleted.bind(this))
      .build();
  }

  onHourSegmentMouseDown({ segment, segmentElement }: { segment: WeekViewHourSegment; segmentElement: HTMLElement }) {
    if (this.timeRangeFixedDuration) {
      this.onEventCreated({
        event: this.createEvent({
          id: uuid.v4(),
          title: '',
          start: segment.date,
          end: addMinutes(segment.date, this.timeRangeFixedDuration),
        }),
      });

      return;
    }

    this.startDragToCreate(segment, segmentElement);
  }

  onEventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent) {
    const timeRange = this.timeRangeByEventId.get(event.id.toString());

    if (timeRange && this.validateUpdatedEvent(event, newStart, newEnd)) {
      this.timeRangeUpdate.next({
        updated: this.timeRangeStrategy.fromCalendarEventTimes({ start: newStart, end: newEnd }),
        original: timeRange,
      });
    }
  }

  private startDragToCreate(segment: WeekViewHourSegment, segmentElement: HTMLElement) {
    const eventFromDrag = {
      id: uuid.v4(),
      title: '',
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
        tap((mouseMoveEvent: MouseEvent) => {
          const minutesDiff = ceilToNearest(mouseMoveEvent.clientY - segmentPosition.top, this.timeRangeGridSize);

          const daysDiff =
            floorToNearest(mouseMoveEvent.clientX - segmentPosition.left, segmentPosition.width) /
            segmentPosition.width;

          const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);

          if (this.eventFromDrag && newEnd > segment.date && newEnd < endOfView) {
            this.eventFromDragSource.next({
              ...this.eventFromDrag,
              end: newEnd,
            });
          }
        }),
        takeUntil(fromEvent(document, 'mouseup')),
      )
      .subscribe();
  }

  private onEventCreated({ event }: { event: CalendarEvent }) {
    if (this.validateCreatedEvent(event)) {
      this.timeRangeCreate.next({
        created: this.timeRangeStrategy.fromCalendarEventTimes(event),
      });
    }
  }

  private onEventDeleted({ event }: { event: CalendarEvent }): void {
    const timeRange = this.timeRangeByEventId.get(event.id.toString());
    if (timeRange) {
      this.timeRangeDelete.next({ deleted: timeRange });
    }
  }

  private createEvent({
    id,
    title,
    start,
    end,
    canResize,
  }: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    canResize?: boolean;
  }): CalendarEvent {
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
      actions: [
        {
          label: '<span class="cal-event-delete"><i class="bi bi-x-circle-fill"></i></span>',
          onClick: ({ event }) => this.onEventDeleted({ event }),
        },
      ],
    };
  }

  private getTimeRangeStrategy() {
    switch (this.mode) {
      case PickerMode.Timetable:
        return new TimetableTimeRangeStrategy(startOfWeek(this.viewDate));
      case PickerMode.Calendar:
        return new CalendarTimeRangeStrategy();
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

    const otherEvents = this.events.filter(x => x.id !== event.id);
    if (checkOverlapping(event, otherEvents)) {
      return false;
    }

    return true;
  };

  private validateUpdatedEvent = (
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

    const otherEvents = this.events.filter(x => x.id !== event.id);
    if (checkOverlapping({ ...event, start: newStart, end: newEnd }, otherEvents)) {
      return false;
    }

    return true;
  };

  ngOnDestroy() {
    this.destroySource.next(true);
    this.destroySource.complete();
  }
}
