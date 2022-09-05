import { LOCALE_ID, Inject, Injectable } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { formatDate } from '@angular/common';

@Injectable()
export class TimeRangeTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  week(event: CalendarEvent): string {
    return `${formatDate(event.start, 'h:mm a', this.locale)} - ${
      event.end ? formatDate(event.end, 'h:mm a', this.locale) : ''
    } ${event.title}`.trim();
  }
}
