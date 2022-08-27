import { NgModule } from '@angular/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { TimeRangePickerComponent } from './components/time-range-picker/time-range-picker.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  imports: [CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })],
  declarations: [TimeRangePickerComponent],
  exports: [TimeRangePickerComponent],
  entryComponents: [],
})
export class SharedModule {}
