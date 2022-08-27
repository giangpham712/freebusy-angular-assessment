import * as uuid from 'uuid';
import { format } from 'date-fns';
import { Component, OnInit } from '@angular/core';
import { PickerMode, TimeRange } from '../../../shared/components/time-range-picker/time-range-picker.component';

@Component({
  selector: 'app-shared',
  templateUrl: 'share.component.html',
})
export class ShareComponent implements OnInit {
  PickerMode = PickerMode;

  times: TimeRange[] = [];

  constructor() {}

  ngOnInit() {
    console.log('ShareComponent: ngOnInit');
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
