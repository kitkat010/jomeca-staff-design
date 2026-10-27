import { describe, expect, it } from 'vitest';
import type { OperationRow } from '@jomeca/shared';
import { prioritizePending, summarizeReservations } from './staff-dashboard';

function row(values: Partial<OperationRow>): OperationRow {
  return {
    id: 'synthetic',
    reference: 'TEST-ONLY',
    customerName: null,
    status: 'confirmed',
    paymentStatus: 'paid',
    startsAt: '2026-10-24T16:30:00Z',
    endsAt: '2026-10-24T17:30:00Z',
    holdUntil: null,
    totalCentavos: 20000,
    paidCentavos: 20000,
    balanceCentavos: 0,
    checkedInAt: null,
    offering: { name: 'Test activity' },
    needsResolution: false,
    ...values,
  };
}
describe('staff reservation summaries', () => {
  it('puts an unpaid pending hold on the first page without dropping rows or changing financial totals', () => {
    const existing = Array.from({ length: 5 }, (_, i) =>
      row({
        reference: `OLD-${i}`,
        status: 'expired',
        startsAt: '2026-10-25T01:00:00Z',
      }),
    );
    const pending = row({
      reference: 'NEW-CASH',
      status: 'pending',
      paymentStatus: 'unpaid',
      paidCentavos: 0,
      startsAt: '2026-10-26T02:00:00Z',
    });
    const input = [...existing, pending];
    const sorted = prioritizePending(input);
    expect(sorted.slice(0, 5).map((r) => r.reference)).toContain('NEW-CASH');
    expect(input[5]).toBe(pending);
    expect(sorted).toHaveLength(6);
    expect(
      summarizeReservations(sorted, '2026-10-25', 7).receivedCentavos,
    ).toBe(summarizeReservations(input, '2026-10-25', 7).receivedCentavos);
  });
  it('buckets starts by Manila date across UTC midnight and month boundaries', () => {
    const result = summarizeReservations(
      [
        row({ startsAt: '2026-10-31T15:59:00Z' }),
        row({ startsAt: '2026-10-31T16:00:00Z' }),
      ],
      '2026-10-31',
      2,
    );
    expect(result.daily.map((day) => [day.date, day.total])).toEqual([
      ['2026-10-31', 1],
      ['2026-11-01', 1],
    ]);
  });
  it('keeps payment receipts separate from booking status and counts manual resolution', () => {
    const result = summarizeReservations(
      [
        row({}),
        row({ status: 'cancelled', paidCentavos: 5000, needsResolution: true }),
        row({ status: 'pending', paymentStatus: 'unpaid', paidCentavos: 0 }),
      ],
      '2026-10-25',
      7,
    );
    expect(result.receivedCentavos).toBe(25000);
    expect(result.confirmed).toBe(1);
    expect(result.pending).toBe(1);
    expect(result.resolution).toBe(1);
    expect(result.statuses.reduce((sum, item) => sum + item.count, 0)).toBe(
      result.total,
    );
  });
  it('represents a genuinely empty range as zero without invented trends', () => {
    const result = summarizeReservations([], '2026-10-24', 7);
    expect(result.total).toBe(0);
    expect(result.receivedCentavos).toBe(0);
    expect(result.daily).toHaveLength(7);
    expect(
      result.daily.every((day) => day.total === 0 && day.confirmed === 0),
    ).toBe(true);
  });
  it('charts net verified money by Manila session date, independently of approval', () => {
    const result = summarizeReservations(
      [
        row({ startsAt: '2026-10-31T15:59:00Z', paidCentavos: 12550 }),
        row({
          startsAt: '2026-10-31T16:00:00Z',
          status: 'cancelled',
          paidCentavos: 3500,
        }),
        row({
          startsAt: '2026-10-31T16:30:00Z',
          status: 'pending',
          paymentStatus: 'unpaid',
          paidCentavos: 0,
        }),
      ],
      '2026-10-31',
      2,
    );
    expect(result.daily.map((day) => day.receivedCentavos)).toEqual([
      12550, 3500,
    ]);
    expect(
      result.daily.reduce((sum, day) => sum + day.receivedCentavos, 0),
    ).toBe(result.receivedCentavos);
    expect(result.daily[1]?.confirmed).toBe(0);
  });
});
