import { useState, type FormEvent } from 'react';
import { Check, X, ArrowLeft, Copy, RefreshCw } from 'lucide-react';
import type { OperationDetail } from '@jomeca/shared';
import { api } from '@/lib/api';
import { money, centavosFromInput } from '@/lib/money';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const rejectionTemplates = [
  [
    'Payment not verified',
    'We could not verify the payment for this reservation. Please contact our team with the correct transaction details.',
  ],
  [
    'Details do not match',
    'The submitted payment details do not match this reservation. Please contact our team to resolve the discrepancy.',
  ],
  [
    'Duplicate request',
    'This is a duplicate request. Please use your original reservation reference when contacting our team.',
  ],
  [
    'Customer requested',
    'This pending request was cancelled at the customer’s request.',
  ],
];
const stamp = (value: string) =>
  new Date(value).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export function StaffRequestReview({
  detail,
  channels,
  csrfToken,
  canManage,
  canReviewPayment,
  onBack,
  onRefresh,
  onChanged,
}: {
  detail: OperationDetail;
  channels: { id: string; name: string; active: boolean }[];
  csrfToken: string;
  canManage: boolean;
  canReviewPayment: boolean;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onChanged: (detail: OperationDetail) => Promise<void>;
}) {
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState('');
  const [receiptReference, setReceiptReference] = useState('');
  const [copied, setCopied] = useState(false);
  const pending = detail.status === 'pending';
  const pendingProof = detail.proofs.find((item) => item.status === 'pending');
  const needsPayment = (detail.balanceCentavos ?? 1) > 0;
  const rejection =
    detail.audit.find((item) => item.action === 'booking.reject')?.reason ??
    reason;
  const message = `Hello ${detail.customerName ?? 'there'}, your reservation request ${detail.reference} for ${detail.offering.name}, ${stamp(detail.startsAt)}–${stamp(detail.endsAt)}, has been rejected.\n\nReason: ${pending ? reason : rejection}\n\nIf you already sent payment, please contact our team for review. This message does not confirm a refund.`;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog) return;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const amount = centavosFromInput(String(values.get('amount') ?? ''));
      if (dialog === 'approve' && needsPayment && amount === null)
        throw Error('Enter the actual amount received.');
      const result = await api<OperationDetail>(
        `/admin/reservations/${detail.reference}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({
            revision: detail.operationRevision,
            decision: dialog,
            ...(dialog === 'reject' ? { reason: reason.trim() } : {}),
            ...(dialog === 'approve' && needsPayment
              ? {
                  payment: {
                    amountCentavos: amount,
                    channelId: values.get('channel'),
                    externalReference: values.get('reference'),
                    bankChecked: values.get('verified') === 'on',
                    ...(pendingProof ? { proofId: pendingProof.id } : {}),
                  },
                }
              : {}),
          }),
        },
      );
      setDialog(null);
      await onChanged(result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to save this decision.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function markReceived() {
    setBusy(true);
    setError('');
    try {
      const result = await api<OperationDetail>(
        `/admin/reservations/${detail.reference}/external-proof`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({
            revision: detail.operationRevision,
            decision: 'received',
            externalReference: receiptReference.trim(),
            reason:
              'Staff matched this ticket and recorded Messenger proof receipt.',
          }),
        },
      );
      await onChanged(result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to mark proof received.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="staff-card request-review"
      aria-label="Reservation review"
    >
      <div className="request-review-heading">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft size={15} />
          Back to queue
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void onRefresh()}
          aria-label="Refresh request"
        >
          <RefreshCw size={15} />
        </Button>
      </div>
      <div className="request-review-title">
        <div>
          <h2>{detail.customerName ?? 'Guest'}</h2>
          <p>{detail.reference}</p>
        </div>
        <span
          className={`staff-badge status-${pending ? 'pending' : detail.status}`}
        >
          {pending
            ? 'Pending'
            : detail.status === 'confirmed'
              ? 'Reserved'
              : detail.status}
        </span>
      </div>
      <div className="request-review-summary">
        <div>
          <small>Court</small>
          <strong>{detail.offering.name}</strong>
        </div>
        <div>
          <small>Schedule · Philippine time</small>
          <strong>
            {stamp(detail.startsAt)}–{stamp(detail.endsAt)}
          </strong>
        </div>
        <div>
          <small>Amount due</small>
          <strong>
            {detail.totalCentavos === null
              ? 'Unconfigured'
              : money(detail.totalCentavos)}
          </strong>
        </div>
      </div>
      <p className="request-contact">
        {detail.customerEmail} · {detail.customerMobile}
      </p>
      {error && !dialog && (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      )}
      {pending ? (
        <>
          <p className="request-deadline">
            Payment hold ends {detail.holdUntil ? stamp(detail.holdUntil) : '—'}
            . The first request keeps this court until its deadline.
          </p>
          {detail.paymentMethod === 'qr' && canReviewPayment && (
            <div className="request-evidence">
              {detail.externalProofStatus === 'pending' ? (
                <p>
                  <strong>Proof received—awaiting verification</strong>
                  <br />
                  {detail.externalProofReference}
                </p>
              ) : (
                !detail.externalProofReceivedAt && (
                  <details>
                    <summary>Mark Messenger proof received</summary>
                    <div className="request-receipt-controls">
                      <label className="ops-field">
                        Message / transfer reference
                        <input
                          value={receiptReference}
                          onChange={(event) =>
                            setReceiptReference(event.target.value)
                          }
                          minLength={3}
                          maxLength={120}
                        />
                      </label>
                      <Button
                        size="sm"
                        disabled={busy || receiptReference.trim().length < 3}
                        onClick={() => void markReceived()}
                      >
                        Mark received
                      </Button>
                    </div>
                    <p>Receipt is not verified payment.</p>
                  </details>
                )
              )}
              {detail.proofs.map((item, index) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant="outline"
                  onClick={() => setProof(proof === item.id ? '' : item.id)}
                >
                  View uploaded proof {index + 1}
                </Button>
              ))}
              {proof && (
                <img
                  className="payment-image"
                  src={`/api/admin/proofs/${proof}/image`}
                  alt="Private payment evidence for staff review"
                />
              )}
            </div>
          )}
          <div className="request-review-actions">
            <Button
              disabled={
                !canManage || busy || (needsPayment && !canReviewPayment)
              }
              onClick={() => {
                setError('');
                setDialog('approve');
              }}
            >
              <Check size={17} />
              Approve reservation
            </Button>
            <Button
              className="request-reject"
              disabled={!canManage || busy}
              onClick={() => {
                setError('');
                setReason('');
                setDialog('reject');
              }}
            >
              <X size={17} />
              Reject request
            </Button>
          </div>
        </>
      ) : (
        <div className="request-decision-result">
          <strong>
            {detail.status === 'confirmed'
              ? 'Court reserved'
              : detail.status === 'rejected'
                ? 'Request rejected'
                : 'This request is no longer awaiting review.'}
          </strong>
          <p>
            It is no longer listed in the pending queue. Approved bookings
            appear under Reserved.
          </p>
          {detail.status === 'rejected' && (
            <>
              <pre>{message}</pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(message)
                    .then(() => setCopied(true));
                }}
              >
                <Copy size={14} />
                {copied ? 'Copied' : 'Copy rejection message'}
              </Button>
            </>
          )}
        </div>
      )}
      <Dialog
        open={!!dialog}
        onOpenChange={(open) => {
          if (!busy && !open) setDialog(null);
        }}
      >
        <DialogContent className="review-decision-dialog">
          <DialogTitle>
            {dialog === 'reject'
              ? 'Reject this request?'
              : 'Verify payment and approve'}
          </DialogTitle>
          <DialogDescription>
            {detail.reference} · {detail.offering.name} ·{' '}
            {stamp(detail.startsAt)}
          </DialogDescription>
          <form onSubmit={(event) => void submit(event)}>
            {dialog === 'reject' ? (
              <>
                <p>
                  Choose a reason template or write your own. The selected
                  reason is saved with this request.
                </p>
                <div className="request-reason-templates">
                  {rejectionTemplates.map(([label, text]) => (
                    <button
                      type="button"
                      key={label}
                      aria-pressed={reason === text}
                      onClick={() => setReason(text!)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="ops-field">
                  Rejection reason · required
                  <textarea
                    minLength={5}
                    maxLength={1000}
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                  />
                </label>
                {reason.trim() && (
                  <details className="request-message-preview">
                    <summary>Customer message preview</summary>
                    <pre>{message}</pre>
                  </details>
                )}
                <p>
                  The court will be released. Any money already received needs
                  separate resolution; rejection does not refund it.
                </p>
              </>
            ) : (
              <>
                {needsPayment ? (
                  <>
                    <p>
                      Check the actual cash or bank/wallet record. A screenshot
                      alone does not verify payment. Payment and approval will
                      be saved together.
                    </p>
                    <label className="ops-field">
                      Payment channel
                      <select
                        name="channel"
                        required
                        defaultValue={pendingProof?.channelId ?? ''}
                      >
                        <option value="" disabled>
                          Choose payment channel
                        </option>
                        {channels
                          .filter(
                            (item) =>
                              (item.active ||
                                item.id === pendingProof?.channelId) &&
                              (!pendingProof ||
                                item.id === pendingProof.channelId),
                          )
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <div className="staff-review-fields">
                      <label className="ops-field">
                        Actual amount received (PHP)
                        <input
                          name="amount"
                          inputMode="decimal"
                          required
                          defaultValue={
                            detail.balanceCentavos === null
                              ? ''
                              : (detail.balanceCentavos / 100).toFixed(2)
                          }
                        />
                      </label>
                      <label className="ops-field">
                        Cash receipt / transfer reference
                        <input
                          name="reference"
                          required
                          minLength={3}
                          maxLength={120}
                        />
                      </label>
                    </div>
                    <label className="consent-check">
                      <input type="checkbox" name="verified" required />I
                      checked the actual transaction and verified this money was
                      received.
                    </label>
                  </>
                ) : (
                  <p>
                    The required payment is already recorded. Approval will
                    confirm this active held reservation.
                  </p>
                )}
              </>
            )}
            {error && (
              <p role="alert" className="admin-alert">
                {error}
              </p>
            )}
            <div className="request-dialog-actions">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setDialog(null)}
              >
                Back
              </Button>
              <Button
                className={dialog === 'reject' ? 'request-reject' : ''}
                disabled={busy}
              >
                {busy
                  ? 'Saving…'
                  : dialog === 'reject'
                    ? 'Reject with this reason'
                    : 'Confirm approval'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
