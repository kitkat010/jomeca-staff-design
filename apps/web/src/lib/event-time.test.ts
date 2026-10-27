import { describe, expect, it } from 'vitest';
import { eventTimeWarnings } from './event-time';
const rules = {
  minMinutes: 240,
  maxMinutes: 720,
  increment: 60,
  hours: [{ start: 540, end: 1440 }],
  conflicts: [{ start: 900, end: 1020 }],
};
describe('event time selection warnings', () => {
  it('allows an adjacent four-hour period ending at midnight', () => {
    expect(eventTimeWarnings({ ...rules, start: 1200, end: 1440 })).toEqual([]);
    expect(eventTimeWarnings({ ...rules, start: 540, end: 900 })).toEqual([]);
  });
  it('reports short, long and reversed ranges', () => {
    expect(
      eventTimeWarnings({ ...rules, start: 1080, end: 1260 }).join(' '),
    ).toContain('minimum duration is 4');
    expect(
      eventTimeWarnings({ ...rules, start: 540, end: 1380 }).join(' '),
    ).toContain('maximum duration is 12');
    expect(
      eventTimeWarnings({ ...rules, start: 1080, end: 540 }).join(' '),
    ).toContain('later than time in');
  });
  it('reports opening-hour and occupied-range violations together', () => {
    const warnings = eventTimeWarnings({ ...rules, start: 480, end: 1080 });
    expect(warnings.join(' ')).toContain('opening hours');
    expect(warnings.join(' ')).toContain('held, booked or blocked');
  });
  it('reports increment violations and a closed day', () => {
    expect(
      eventTimeWarnings({ ...rules, start: 550, end: 850 }).join(' '),
    ).toContain('60-minute increments');
    expect(
      eventTimeWarnings({ ...rules, hours: [], start: 540, end: 780 }).join(
        ' ',
      ),
    ).toContain('closed on this date');
  });
});
