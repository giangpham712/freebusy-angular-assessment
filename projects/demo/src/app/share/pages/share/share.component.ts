import * as uuid from 'uuid';
import { addMinutes, format } from 'date-fns';
import { Component, OnInit } from '@angular/core';
import { PickerMode, TimeRange } from '../../../shared/components/time-range-picker/time-range-picker.component';

@Component({
  selector: 'app-shared',
  templateUrl: 'share.component.html',
})
export class ShareComponent implements OnInit {
  PickerMode = PickerMode;

  times: TimeRange[] = [{ start: new Date(), end: addMinutes(new Date(), 30) }];

  meetingDuration: number;

  meetingDurations: { name: string; value: number }[] = [
    { name: '15 minutes', value: 15 },
    { name: '30 minutes', value: 30 },
    { name: '60 minutes', value: 60 },
    { name: '90 minutes', value: 90 },
    { name: '2 hours', value: 120 },
  ];

  constructor() {}

  ngOnInit() {
    console.log('ShareComponent: ngOnInit');
    this.meetingDuration = 60;
  }

  onMeetingDurationChange = () => {
    console.log(this.meetingDuration);
  };

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
