import type { RateData } from '@jomeca/shared';

// Editing a price must not reset the saved options that are absent from the UI.
export function courtRateOptions(
  rate: RateData | undefined,
  data: FormData,
  closingMinute: number,
) {
  const text = (name: string) => String(data.get(name) ?? '').trim();
  if (rate)
    return {
      tier: rate.tier,
      effectiveFrom: rate.effectiveFrom,
      effectiveUntil: rate.effectiveUntil,
      priority: rate.priority,
      active: rate.active,
      endMinute: closingMinute === 0 ? 1440 : closingMinute,
    };
  return {
    tier: text('tier'),
    effectiveFrom: text('from'),
    effectiveUntil: text('until') || null,
    priority: Number(text('priority')),
    active: data.get('active') === 'on',
    endMinute: data.get('midnight') === 'on' ? 1440 : closingMinute,
  };
}
