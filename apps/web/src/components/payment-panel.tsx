import { useEffect, useState, type FormEvent } from 'react';
import type { PaymentInstructions } from '@jomeca/shared';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/money';
import { DownloadTicket } from '@/components/download-ticket';

export function PaymentPanel({
  reference,
  token,
  onChange,
}: {
  reference: string;
  token: string;
  onChange?: () => void;
}) {
  const [data, setData] = useState<PaymentInstructions | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    api<PaymentInstructions>(`/reservations/${reference}/payment`, {
      headers: { 'X-Reservation-Token': token },
    })
      .then((v) => {
        if (alive) setData(v);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [reference, token]);
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      f = new FormData(form),
      file = f.get('proof');
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPEG, PNG or WebP image no larger than 5 MB.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(
        `/reservations/${reference}/proofs?channelId=${encodeURIComponent(String(f.get('channel')))}`,
        {
          method: 'POST',
          headers: {
            'X-Reservation-Token': token,
            'Content-Type': 'application/octet-stream',
          },
          body: file,
        },
      );
      setData(
        await api<PaymentInstructions>(`/reservations/${reference}/payment`, {
          headers: { 'X-Reservation-Token': token },
        }),
      );
      form.reset();
      setMessage(
        'Proof received for staff review. This does not confirm payment or your booking.',
      );
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to upload');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="payment-panel">
      <h3>
        {data && (!data.enabled || data.balanceCentavos === 0)
          ? 'Payment status and ticket'
          : data?.paymentMethod === 'cash'
            ? 'Pay cash at the counter'
            : 'Scan to pay'}
      </h3>
      {error && (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {!data && !error && <p role="status">Loading payment instructions…</p>}
      {data && (
        <>
          <p>
            Verified received: {money(data.paidCentavos)} · Balance:{' '}
            {data.balanceCentavos === null
              ? 'Unconfigured'
              : money(data.balanceCentavos)}
          </p>
          {data.balanceCentavos === 0 ? (
            <p>
              No further payment is due. Staff have verified the full quoted
              amount.
            </p>
          ) : !data.enabled ? (
            <p>
              Payment submissions are unavailable. Contact staff if you have
              already sent money.
            </p>
          ) : data.paymentMethod === 'cash' ? (
            <div className="cash-payment-instructions">
              <p>
                Bring your ticket to the counter and pay the full quoted amount
                before the hold expires. Staff will record the cash received and
                separately approve your reservation.
              </p>
              {data.holdUntil && (
                <p>
                  <strong>
                    Pay by{' '}
                    {new Date(data.holdUntil).toLocaleString('en-PH', {
                      timeZone: 'Asia/Manila',
                    })}{' '}
                    (Philippine time).
                  </strong>
                </p>
              )}
              <p>
                A downloaded ticket is unpaid until staff verifies the cash. An
                expired hold releases the court.
              </p>
            </div>
          ) : (
            <>
              <p>
                {data.policy?.mode === 'full'
                  ? 'Full payment is required.'
                  : `Required for approval: ${money(data.policy?.requiredCentavos ?? 0)}.`}{' '}
                Staff verify against actual wallet/bank records.
              </p>
              <p className="field-hint">
                {data.policy?.proofExtendsHold
                  ? `The first accepted proof upload extends the review hold by up to ${data.policy.reviewMinutes} minutes from submission, capped at session start. Further uploads do not extend it.`
                  : 'Uploading proof does not extend the inventory hold.'}{' '}
                {data.holdUntil && (
                  <>
                    Current hold deadline:{' '}
                    {new Date(data.holdUntil).toLocaleString('en-PH', {
                      timeZone: 'Asia/Manila',
                    })}{' '}
                    (Philippine time).
                  </>
                )}
              </p>
              {data.channels.map((c) => (
                <details key={c.id} open>
                  <summary>{c.name} payment instructions</summary>
                  <p>
                    {c.accountName}
                    <br />
                    {c.accountNumber}
                  </p>
                  {c.qrDataUrl && (
                    <img
                      className="payment-image"
                      src={c.qrDataUrl}
                      alt={`${c.name} payment QR code`}
                    />
                  )}
                  <p className="policy-copy">{c.instructions}</p>
                </details>
              ))}
              <form className="planning-form" onSubmit={upload}>
                <fieldset
                  className="booking-fieldset"
                  disabled={busy || data.proofs.length >= 3}
                >
                  <label className="field-label" htmlFor="payment-channel">
                    Payment channel
                  </label>
                  <select id="payment-channel" name="channel" required>
                    {data.channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <label className="field-label" htmlFor="payment-proof">
                    Upload payment receipt or screenshot
                  </label>
                  <input
                    id="payment-proof"
                    name="proof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                  />
                  <p className="field-hint">
                    Maximum 5 MB. Only include payment details needed for
                    review. Up to three uploads; contact staff for further help.
                  </p>
                  <Button disabled={busy || !data.channels.length}>
                    {busy ? 'Uploading…' : 'Submit proof for review'}
                  </Button>
                </fieldset>
              </form>
            </>
          )}
          {data.proofs.map((p, n) => (
            <p key={p.id}>
              Proof {n + 1}: {p.status}
              {p.reviewReason ? ` — ${p.reviewReason}` : ''}
            </p>
          ))}
        </>
      )}
      <DownloadTicket reference={reference} token={token} />
    </section>
  );
}
