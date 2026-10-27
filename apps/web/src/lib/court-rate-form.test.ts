import { expect, it } from 'vitest';
import type { RateData } from '@jomeca/shared';
import { courtRateOptions } from './court-rate-form';

const saved: RateData = {
  id: 'test-rate',
  offeringId: 'test-court',
  name: 'Synthetic rate',
  hourlyCentavos: 30000,
  tier: 'member',
  weekday: null,
  startMinute: 0,
  endMinute: 1440,
  effectiveFrom: '2026-10-01',
  effectiveUntil: '2026-11-30',
  priority: 17,
  active: false,
};
it('preserves all removed edit controls even though they are absent from the form', () => {
  const result = courtRateOptions(saved, new FormData(), 0);
  expect(result).toEqual({
    tier: 'member',
    effectiveFrom: '2026-10-01',
    effectiveUntil: '2026-11-30',
    priority: 17,
    active: false,
    endMinute: 1440,
  });
  expect(
    courtRateOptions({ ...saved, effectiveUntil: null }, new FormData(), 0)
      .effectiveUntil,
  ).toBeNull();
});
it('lets the displayed closing time change without a hidden midnight flag overriding it', () => {
  const data = new FormData();
  data.set('midnight', 'on');
  expect(courtRateOptions(saved, data, 1320).endMinute).toBe(1320);
});
it('retains explicitly supplied options when creating a new rate', () => {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    tier: 'standard',
    from: '2026-11-01',
    until: '2026-12-31',
    priority: '4',
    active: 'on',
    midnight: 'on',
  }))
    data.set(key, value);
  expect(courtRateOptions(undefined, data, 0)).toEqual({
    tier: 'standard',
    effectiveFrom: '2026-11-01',
    effectiveUntil: '2026-12-31',
    priority: 4,
    active: true,
    endMinute: 1440,
  });
});
