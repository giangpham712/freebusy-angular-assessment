import { TestBed } from '@angular/core/testing';
import * as uuid from 'uuid';
import { CalendarEventBuilder } from './calendar-event-builder.provider';

describe('CalendarEventBuilder', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  let builder: CalendarEventBuilder;
  beforeEach(() => {
    builder = new CalendarEventBuilder();
  });

  it('build should return event', () => {
    const event = builder.build();

    expect(event).toBeTruthy();
    expect(typeof event).toBe('object');
  });

  it('reset should initialize a calendar event with default data', () => {
    builder.reset();

    const event = builder.build();

    expect(uuid.validate(event.id)).toBe(true);
    expect(event.start instanceof Date).toBe(true);
    expect(event.end instanceof Date).toBe(true);
    expect(event.title).toBe('');
    expect(event.actions).toEqual([]);
    expect(event.draggable).toBe(true);
  });

  it('withStartTime should set event start correctly', () => {
    builder.reset();
    builder.withStartTime(new Date(2021, 12, 1, 4, 3, 1));

    const event = builder.build();

    expect(event.start).toEqual(new Date(2021, 12, 1, 4, 3, 1));
  });

  it('withEndTime should set event end correctly', () => {
    builder.reset();
    builder.withEndTime(new Date(2022, 3, 4, 4, 3, 1));

    const event = builder.build();

    expect(event.end).toEqual(new Date(2022, 3, 4, 4, 3, 1));
  });

  it('withVariableDuration should make event resizable', () => {
    builder.reset();
    builder.withVariableDuration();

    const event = builder.build();

    expect(event.resizable).toEqual({ beforeStart: true, afterEnd: true });
  });

  it('withVariableDuration should set event end time correctly and make event not resizable', () => {
    builder.reset();
    builder.withStartTime(new Date(2021, 12, 1, 4, 30, 0));
    builder.withFixedDuration(45);

    const event = builder.build();

    expect(event.end).toEqual(new Date(2021, 12, 1, 5, 15, 0));
    expect(event.resizable).toBeUndefined();
  });

  it('onDelete should set delete action callback for event', () => {
    builder.reset();
    builder.onDelete(e => {
      console.log(e);
    });

    const event = builder.build();

    console.log = jasmine.createSpy('log');

    expect(event.actions.find(x => x.id === 'delete')).toBeTruthy();
    const mouseEvent = {} as MouseEvent;

    event.actions.find(x => x.id === 'delete').onClick({ event, sourceEvent: mouseEvent });
    expect(console.log).toHaveBeenCalledWith({ event, sourceEvent: mouseEvent });
  });
});
