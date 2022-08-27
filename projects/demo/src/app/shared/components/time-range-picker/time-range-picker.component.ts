import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-range-picker',
  templateUrl: 'time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
})
export class TimeRangePickerComponent implements OnInit {
  viewDate = new Date();
  events = [];

  constructor() {}

  ngOnInit() {}
}
