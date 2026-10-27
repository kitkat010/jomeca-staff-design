import { useState, type FormEvent } from 'react';
import type { ReservationReceipt } from '@jomeca/shared';
import { PageHeading } from '@/components/public-ui';
import { PaymentPanel } from '@/components/payment-panel';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export function ReservationStatusPage() {
  const [credentials, setCredentials] = useState<{
      reference: string;
      token: string;
    } | null>(null),
    [receipt, setReceipt] = useState<ReservationReceipt | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function lookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      next = {
        reference: String(f.get('reference')).trim(),
        token: String(f.get('token')).trim(),
      };
    setBusy(true);
    setError('');
    try {
      const row = await api<ReservationReceipt>(
        `/reservations/${encodeURIComponent(next.reference)}`,
        { headers: { 'X-Reservation-Token': next.token } },
      );
      setReceipt(row);
      setCredentials(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to look up booking',
      );
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    if (!credentials) return;
    setBusy(true);
    setError('');
    try {
      setReceipt(
        await api<ReservationReceipt>(
          `/reservations/${encodeURIComponent(credentials.reference)}`,
          { headers: { 'X-Reservation-Token': credentials.token } },
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading label="Reservation status" title="Check your request.">
        Use the private access details supplied with your request. Keep the
        access token private.
      </PageHeading>
      <section className="wrap page-section narrow-copy">
        {error && (
          <p role="alert" className="admin-alert">
            {error}
          </p>
        )}
        <form className="planning-form" onSubmit={lookup}>
          <label className="field-label" htmlFor="lookup-ref">
            Reservation reference
          </label>
          <input id="lookup-ref" name="reference" maxLength={40} required />
          <label className="field-label" htmlFor="lookup-token">
            Private access token
          </label>
          <input
            id="lookup-token"
            name="token"
            type="password"
            autoComplete="off"
            maxLength={43}
            required
          />
          <Button disabled={busy}>{busy ? 'Checking…' : 'Check status'}</Button>
        </form>
        {receipt && credentials && (
          <>
            <h2>{receipt.reference}</h2>
            <p>
              {receipt.status} · Payment: {receipt.paymentStatus}
            </p>
            <p>{receipt.message}</p>
            <p>
              Hold until:{' '}
              {receipt.holdUntil
                ? new Date(receipt.holdUntil).toLocaleString('en-PH', {
                    timeZone: 'Asia/Manila',
                  }) + ' (Manila)'
                : 'No active hold'}
            </p>
            <PaymentPanel
              key={`${receipt.status}/${receipt.paymentStatus}/${receipt.holdUntil}`}
              reference={credentials.reference}
              token={credentials.token}
              onChange={() => void refresh()}
            />
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void refresh()}
            >
              Refresh status
            </Button>
          </>
        )}
      </section>
    </>
  );
}
