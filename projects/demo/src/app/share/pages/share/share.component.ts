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

  timeRanges: TimeRange[] = [];

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
    this.timeRanges = this.timeRanges.map(time => ({
      ...time,
      end: addMinutes(time.start, this.meetingDuration),
    }));
  };

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
