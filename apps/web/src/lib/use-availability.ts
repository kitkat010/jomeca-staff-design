import { useEffect, useMemo, useState } from 'react';
import type { AvailabilityResult } from '@jomeca/shared';
import { api } from '@/lib/api';

interface AvailabilityState {
  request: { query: string; attempt: number } | null;
  result: AvailabilityResult | null;
  error: string;
  loading: boolean;
}

// Results are bound to the exact selection. Superseded requests cannot restore old slots.
export function useAvailability(
  offeringCode: string | undefined,
  date: string,
  durationMinutes: number,
  enabled: boolean,
) {
  const [attempt, setAttempt] = useState(0);
  const key =
    enabled && offeringCode
      ? new URLSearchParams({
          offeringCode,
          date,
          durationMinutes: String(durationMinutes),
        }).toString()
      : '';
  const request = useMemo(() => ({ query: key, attempt }), [key, attempt]);
  const [state, setState] = useState<AvailabilityState>({
    request: null,
    result: null,
    error: '',
    loading: false,
  });
  useEffect(() => {
    const key = request.query;
    if (!key) return;
    const controller = new AbortController();
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const result = await api<AvailabilityResult>(
          `/booking/availability?${key}`,
          {
            signal: controller.signal,
          },
        );
        if (active) setState({ request, result, error: '', loading: false });
      } catch (error: unknown) {
        if (active)
          setState({
            request,
            result: null,
            error:
              error instanceof Error
                ? error.message
                : 'Unable to load the court schedule.',
            loading: false,
          });
      } finally {
        pending = false;
      }
    };
    const timer = window.setTimeout(() => void refresh(), 250);
    const interval = window.setInterval(() => void refresh(), 10000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      controller.abort();
    };
  }, [request]);
  return {
    result: key && state.request === request ? state.result : null,
    error: key && state.request === request ? state.error : '',
    loading: !!key && (state.request !== request || state.loading),
    retry: () => setAttempt((value) => value + 1),
  };
}
