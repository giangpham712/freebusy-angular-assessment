import { addMinutes } from 'date-fns';
import { Component, OnInit } from '@angular/core';
import { PickerMode, TimeRange } from '../../../shared/components/time-range-picker/types';

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
    this.timeRanges = this.timeRanges.map(timeRange => ({
      ...timeRange,
      endTime: addMinutes(timeRange.startTime, this.meetingDuration),
    }));
  };

  onTimeRangeCreate = ({ created }: { created: TimeRange }) => {
    const newTimeRange: TimeRange = {
      ...created,
    };

    this.timeRanges = [...this.timeRanges, newTimeRange];
  };

  onTimeRangeDelete = ({ deleted }: { deleted: TimeRange }) => {
    this.timeRanges = this.timeRanges.filter(x => x !== deleted);
  };

  onTimeRangeUpdate = ({ updated, original }: { updated: TimeRange; original: TimeRange }) => {
    this.timeRanges = this.timeRanges.map(x => {
      if (x === original) {
        return updated;
      }

      return x;
    });
  };
}
