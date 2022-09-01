import { NgModule } from '@angular/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { TimeRangePickerComponent } from './components/time-range-picker/time-range-picker.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { TimeRangePickerHeaderComponent } from './components/time-range-picker/time-range-picker-header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeRangePickerHourSegmentComponent } from './components/time-range-picker/time-range-picker-hour-segment.component';
import { CalendarEventBuilder } from './components/time-range-picker/services/calendar-event-builder.provider';

@NgModule({
  imports: [CommonModule, FormsModule, CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })],
  declarations: [TimeRangePickerComponent, TimeRangePickerHeaderComponent, TimeRangePickerHourSegmentComponent],
  exports: [FormsModule, TimeRangePickerComponent],
  entryComponents: [],
  providers: [{ provide: CalendarEventBuilder, useClass: CalendarEventBuilder }],
})
export class SharedModule {}
