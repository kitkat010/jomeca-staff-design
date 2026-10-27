// @vitest-environment happy-dom
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { WeeklyHoursRow } from './weekly-hours-row';

it('switches a day closed without dropping its saved opening, closing or overnight values', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        h(
          'form',
          null,
          h(WeeklyHoursRow, {
            day: {
              weekday: 0,
              opensMinute: 540,
              closesMinute: 1440,
              closed: false,
            },
            label: 'Sunday',
          }),
        ),
      ),
    );
    const form = host.querySelector('form')!;
    const toggle = host.querySelector<HTMLButtonElement>('[role=switch]')!;
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(new FormData(form).get('closed0')).toBeNull();
    await act(async () => toggle.click());
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    const data = new FormData(form);
    expect(data.get('closed0')).toBe('on');
    expect(data.get('open0')).toBe('09:00');
    expect(data.get('close0')).toBe('00:00');
    expect(data.get('next0')).toBe('on');
    expect(
      host.querySelector<HTMLDivElement>('.weekly-hours-times')?.hidden,
    ).toBe(true);
    await act(async () => toggle.click());
    expect(new FormData(form).get('closed0')).toBeNull();
    expect(new FormData(form).get('open0')).toBe('09:00');
  } finally {
    await act(async () => root.unmount());
  }
});

it('changes the overnight flag explicitly and retains non-midnight closing times', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        h(
          'form',
          null,
          h(WeeklyHoursRow, {
            day: {
              weekday: 1,
              opensMinute: 540,
              closesMinute: 1320,
              closed: false,
            },
            label: 'Monday',
          }),
        ),
      ),
    );
    const form = host.querySelector('form')!;
    const overnight = host.querySelector<HTMLButtonElement>(
      '[aria-label="Monday closes the next day"]',
    )!;
    expect(new FormData(form).get('next1')).toBeNull();
    await act(async () => overnight.click());
    expect(overnight.getAttribute('aria-pressed')).toBe('true');
    expect(new FormData(form).get('next1')).toBe('on');
    expect(new FormData(form).get('close1')).toBe('22:00');
  } finally {
    await act(async () => root.unmount());
  }
});
