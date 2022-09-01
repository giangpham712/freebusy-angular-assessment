import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-time-range-picker-header',
  template: `
    <div class="row text-center mb-3">
      <div class="col-md-4 text-end">
        <div
          class="btn btn-outline-primary"
          mwlCalendarPreviousView
          [view]="view"
          [(viewDate)]="viewDate"
          (viewDateChange)="viewDateChange.next(viewDate)"
        >
          <i class="bi bi-arrow-left"></i>
        </div>
      </div>
      <div class="col-md-4">
        <h3>{{ viewDate | calendarDate: view + 'ViewTitle' }}</h3>
      </div>
      <div class="col-md-4 text-start">
        <div
          class="btn btn-outline-primary"
          mwlCalendarNextView
          [view]="view"
          [(viewDate)]="viewDate"
          (viewDateChange)="viewDateChange.next(viewDate)"
        >
          <i class="bi bi-arrow-right"></i>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeRangePickerHeaderComponent {
  @Input() view: CalendarView = CalendarView.Week;

  @Input() viewDate: Date = new Date();

  @Output() viewChange = new EventEmitter<CalendarView>();

  @Output() viewDateChange = new EventEmitter<Date>();

  CalendarView = CalendarView;
}
