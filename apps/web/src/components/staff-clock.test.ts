// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { StaffClock } from './staff-clock';

it('shows Philippine time, ticks across midnight and clears its timer on unmount', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-27T15:59:59Z'));
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(StaffClock)));
    expect(host.querySelector('time')?.textContent).toBe('11:59:59 PM');
    await act(async () => vi.advanceTimersByTime(1000));
    expect(host.querySelector('time')?.textContent).toBe('12:00:00 AM');
    expect(host.querySelector('time')?.dateTime).toBe(
      '2026-10-27T16:00:00.000Z',
    );
  } finally {
    await act(async () => root.unmount());
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  }
});
