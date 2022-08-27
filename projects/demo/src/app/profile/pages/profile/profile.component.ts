import * as uuid from 'uuid';
import { format } from 'date-fns';
import { Component, OnInit } from '@angular/core';
import { PickerMode, TimeRange } from '../../../shared/components/time-range-picker/time-range-picker.component';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  times: TimeRange[] = [];

  PickerMode = PickerMode;

  constructor() {}

  ngOnInit() {
    console.log('ProfileComponent: ngOnInit');
  }

  onTimeSelect = (event: TimeRange) => {
    console.log('onTimeSelect', event);

    const newEvent = {
      ...event,
      id: uuid.v4(),
      title: `${format(event.start, 'p')} - ${format(event.end, 'p')}`,
    };

    this.times = [...this.times, newEvent];
  };

  onTimeDelete = (event: TimeRange) => {
    console.log('onTimeDelete', event);
    this.times = this.times.filter(x => x.id !== event.id);
  };

  onTimeUpdate = (event: TimeRange) => {
    console.log('onTimeUpdate', event);
    this.times = this.times.map(x => {
      if (x.id !== event.id) {
        return x;
      }

      return event;
    });
  };
}
