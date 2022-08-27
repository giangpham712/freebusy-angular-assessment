import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-time-range-picker-header',
  templateUrl: 'time-range-picker-header.component.html',
  styleUrls: ['time-range-picker-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeRangePickerHeaderComponent {
  @Input() view: CalendarView = CalendarView.Week;

  @Input() viewDate: Date = new Date();

  @Output() viewChange = new EventEmitter<CalendarView>();

  @Output() viewDateChange = new EventEmitter<Date>();

  CalendarView = CalendarView;
}
