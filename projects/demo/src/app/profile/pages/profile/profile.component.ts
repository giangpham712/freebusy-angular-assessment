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

  onTimeRangeCreate = ({ created }: { created: TimeRange }) => {
    const newTimeRange = {
      ...created,
      id: uuid.v4(),
      title: `${format(created.start, 'p')} - ${format(created.end, 'p')}`,
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
