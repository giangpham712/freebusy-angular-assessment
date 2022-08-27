import { NgModule } from '@angular/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { TimeRangePickerComponent } from './components/time-range-picker/time-range-picker.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { TimeRangePickerHeaderComponent } from './components/time-range-picker/header/time-range-picker-header.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })],
  declarations: [TimeRangePickerComponent, TimeRangePickerHeaderComponent],
  exports: [TimeRangePickerComponent],
  entryComponents: [],
})
export class SharedModule {}
