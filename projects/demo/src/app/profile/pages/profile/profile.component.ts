import * as uuid from 'uuid';
import { format } from 'date-fns';
import { Component, OnInit } from '@angular/core';
import { PickerMode, TimeRange } from '../../../shared/components/time-range-picker/time-range-picker.component';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  timeRanges: TimeRange[] = [];

  PickerMode = PickerMode;

  constructor() {}

  ngOnInit() {
    console.log('ProfileComponent: ngOnInit');
  }

  onTimeRangeSelect = (event: TimeRange) => {
    console.log('onTimeSelect', event);

    const newEvent = {
      ...event,
      id: uuid.v4(),
      title: `${format(event.start, 'p')} - ${format(event.end, 'p')}`,
    };

    this.timeRanges = [...this.timeRanges, newEvent];
  };

  onTimeRangeDelete = (timeRange: TimeRange) => {
    console.log('onTimeDelete', timeRange);
    this.timeRanges = this.timeRanges.filter(x => x !== timeRange);
  };

  onTimeRangeUpdate = (timeRange: TimeRange) => {
    console.log('onTimeUpdate', timeRange);
    this.timeRanges = this.timeRanges.map(x => {
      if (x === timeRange) {
        return x;
      }

      return timeRange;
    });
  };
}
