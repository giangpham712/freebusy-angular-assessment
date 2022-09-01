import { Component, OnInit } from '@angular/core';
import { PickerMode, TimeRange } from '../../../shared/components/time-range-picker/types';

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
