import { DebugElement, getDebugNode } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CalendarWeekViewComponent } from 'angular-calendar';
import { TimeRangePickerComponent } from './time-range-picker.component';
import { TimeRangePickerHourSegmentComponent } from './time-range-picker-hour-segment.component';
import { PickerMode } from './types';

describe('TimeRangePickerComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [TimeRangePickerComponent],
    }).compileComponents();
  }));

  it('should have calendar week view', waitForAsync(() => {
    const fixture = TestBed.createComponent(TimeRangePickerComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mwl-calendar-week-view')).not.toBe(null);
  }));

  it('should show calendar header for Calendar mode', waitForAsync(() => {
    const fixture = TestBed.createComponent(TimeRangePickerComponent);
    fixture.componentInstance.mode = PickerMode.Calendar;

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-time-range-picker-header')).not.toBe(null);
  }));

  it('should not show calendar header for Timetable mode', waitForAsync(() => {
    const fixture = TestBed.createComponent(TimeRangePickerComponent);
    fixture.componentInstance.mode = PickerMode.Timetable;

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-time-range-picker-header')).toBe(null);
  }));
});
