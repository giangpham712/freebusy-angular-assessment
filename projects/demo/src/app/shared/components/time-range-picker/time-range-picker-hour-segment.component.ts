import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { WeekViewHourSegment } from 'calendar-utils';

@Component({
  selector: 'app-time-range-picker-hour-segment',
  template: `
    <div
      #segmentElement
      class="cal-hour-segment"
      [style.height.px]="segmentHeight"
      [class.cal-hour-start]="segment.isStart"
      [class.cal-after-hour-start]="!segment.isStart"
      [ngClass]="segment.cssClass"
      (mousedown)="onMouseDown(segment, $event, segmentElement)"
    >
      <div class="cal-time" *ngIf="isTimeLabel">
        {{ segment.date | calendarDate: 'weekViewHour':locale }}
      </div>
    </div>
  `,
})
export class TimeRangePickerHourSegmentComponent {
  constructor() {}

  @Output()
  mouseDown = new EventEmitter<{
    segment: WeekViewHourSegment;
    event: MouseEvent;
    segmentElement: HTMLElement;
  }>();

  @Input() segment: WeekViewHourSegment;

  @Input() segmentHeight: number;

  @Input() locale: string;

  @Input() isTimeLabel: boolean;

  @Input() daysInWeek: number;

  @Input() customTemplate: TemplateRef<any>;

  onMouseDown(segment: WeekViewHourSegment, event: MouseEvent, segmentElement: HTMLElement) {
    this.mouseDown.next({ segment, event, segmentElement });
  }
}
