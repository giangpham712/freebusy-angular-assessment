import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  Injector,
  ViewChild,
} from '@angular/core';
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
import { ceilToNearest, floorToNearest } from './utils';
import { TimetableTimeRangeStrategy } from './services/timetable-time-range-strategy.provider';
import { CalendarTimeRangeStrategy } from './services/calendar-time-range-strategy.provider';
import { TimeRangeStrategy } from './services/time-range-strategy.interface';
import { CalendarEventBuilder } from './services/calendar-event-builder.provider';
import { TimeRangeTitleFormatter } from './services/time-range-title-formatter.provider';
import { CalendarEventValidationHelper } from './services/calendar-event-validation-helper.provider';

/**
 *
 */
@Component({
  selector: 'app-time-range-picker',
  templateUrl: './time-range-picker.component.html',
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
   * In Calendar mode, the time picker shows specific dates (with date, month, year) and user can navigate to previous and next months
   * Picked time ranges will have specific dates
   *
   * In Timetable mode, the time picker only shows days in week (Monday to Sunday)
   * Picked time ranges will not have specific dates
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

    calendarEventBuilder = calendarEventBuilder
      .reset()
      .withStartTime(start)
      .withEndTime(end)
      .onDelete(this.onEventDeleted.bind(this));

    if (!this.timeRangeFixedDuration) {
      calendarEventBuilder = calendarEventBuilder.withVariableDuration();
    }

    return calendarEventBuilder.build();
  }

  onHourSegmentMouseDown({ segment, segmentElement }: { segment: WeekViewHourSegment; segmentElement: HTMLElement }) {
    if (this.timeRangeFixedDuration) {
      let calendarEventBuilder = this.injector.get(CalendarEventBuilder);
      const event = calendarEventBuilder
        .reset()
        .withStartTime(segment.date)
        .withFixedDuration(this.timeRangeFixedDuration)
        .build();

      this.onEventCreated({
        event,
      });

      return;
    }

    this.startDragToCreate(segment, segmentElement);
  }

  private startDragToCreate(segment: WeekViewHourSegment, segmentElement: HTMLElement) {
    let calendarEventBuilder = this.injector.get(CalendarEventBuilder);
    const eventFromDrag = calendarEventBuilder
      .reset()
      .withStartTime(segment.date)
      .withEndTime(addMinutes(segment.date, this.timeRangeGridSize))
      .withVariableDuration()
      .build();

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
    const validationHelper = new CalendarEventValidationHelper(this.events);
    if (validationHelper.validateCreate(event)) {
      this.timeRangeCreate.next({
        created: this.timeRangeStrategy.fromCalendarEventTimes(event),
      });
    }
  }

  onEventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent) {
    const timeRange = this.timeRangeByEventId.get(event.id.toString());
    const validationHelper = new CalendarEventValidationHelper(this.events);

    if (timeRange && validationHelper.validateUpdate(event, newStart, newEnd)) {
      this.timeRangeUpdate.next({
        updated: this.timeRangeStrategy.fromCalendarEventTimes({ start: newStart, end: newEnd }),
        original: timeRange,
      });
    }
  }

  private onEventDeleted({ event }: { event: CalendarEvent }): void {
    const timeRange = this.timeRangeByEventId.get(event.id.toString());
    if (timeRange) {
      this.timeRangeDelete.next({ deleted: timeRange });
    }
  }

  private getTimeRangeStrategy() {
    switch (this.mode) {
      case PickerMode.Timetable:
        return new TimetableTimeRangeStrategy(startOfWeek(this.viewDate));
      case PickerMode.Calendar:
        return new CalendarTimeRangeStrategy();
    }
  }

  ngOnDestroy() {
    this.destroySource.next(true);
    this.destroySource.complete();
  }
}
