import { describe, expect, it } from 'vitest';
import {
  addCalendarMonths,
  emailLink,
  endLabel,
  manilaDate,
  shiftDate,
} from './planning';

describe('public schedule planning', () => {
  it('uses the Manila calendar date around the UTC boundary', () => {
    expect(manilaDate(new Date('2026-10-18T15:59:00Z'))).toBe('2026-10-18');
    expect(manilaDate(new Date('2026-10-18T16:00:00Z'))).toBe('2026-10-19');
  });
  it('adds days across month and year boundaries', () => {
    expect(shiftDate('2026-12-30', 7)).toBe('2027-01-06');
  });
  it('uses calendar months and clamps leap-day dates', () => {
    expect(addCalendarMonths('2028-02-29', 12)).toBe('2029-02-28');
    expect(addCalendarMonths('2026-01-31', 1)).toBe('2026-02-28');
  });
  it('labels midnight as a next-day boundary', () => {
    expect(endLabel(20, 4)).toBe('12 midnight (next-day boundary)');
    expect(endLabel(11, 1)).toBe('12:00 PM');
  });
  it('encodes enquiry content instead of allowing extra mail headers', () => {
    const url = new URL(
      emailLink('Game & gathering?', ['Notes: a&b', 'No booking yet.']),
    );
    expect(url.searchParams.get('subject')).toBe('Game & gathering?');
    expect(url.searchParams.get('body')).toBe('Notes: a&b\nNo booking yet.');
    expect(url.searchParams.has('b')).toBe(false);
  });
});
