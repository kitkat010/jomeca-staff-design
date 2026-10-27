import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MessageCircle,
  QrCode,
  Banknote,
} from 'lucide-react';
import type {
  BookingCatalog,
  QuoteData,
  ReservationReceipt,
} from '@jomeca/shared';
import { site } from '@/content/site';
import { PageHeading, Notice } from '@/components/public-ui';
import {
  addCalendarMonths,
  emailLink,
  manilaDate,
  shiftDate,
} from '@/lib/planning';
import { money } from '@/lib/money';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PaymentPanel } from '@/components/payment-panel';
import {
  SportsPlanner,
  courtSport,
  durationLabel,
  preferredDateLabel,
} from '@/components/sports-planner';
import { StockPhoto } from '@/components/stock-photo';
import { useAvailability } from '@/lib/use-availability';

const time = (date: string) =>
  new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
const sessionTime = (start: string, end: string) =>
  `${time(start)}–${time(end)}${manilaDate(new Date(end)) !== manilaDate(new Date(start)) ? ' (ends next day)' : ''}`;

export function ReservationsPage({
  gymnasiumOnly = false,
}: {
  gymnasiumOnly?: boolean;
}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [catalog, setCatalog] = useState<BookingCatalog | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState('');
  const [court, setCourt] = useState(
      gymnasiumOnly
        ? 'basketball-hall'
        : (params.get('court') ?? 'pickleball-1'),
    ),
    [date, setDate] = useState(''),
    [duration, setDuration] = useState(60),
    [selected, setSelected] = useState('');
  const [promo, setPromo] = useState(''),
    [rentals, setRentals] = useState<Record<string, number>>({}),
    [quote, setQuote] = useState<QuoteData | null>(null),
    [receipt, setReceipt] = useState<ReservationReceipt | null>(null);
  const requestKey = useRef('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const requestDetails = useRef<Record<string, unknown> | null>(null);
  useEffect(() => {
    let alive = true;
    api<BookingCatalog>('/booking/catalog')
      .then((value) => {
        if (alive) setCatalog(value);
      })
      .catch((err) => {
        if (alive)
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load booking information.',
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  const offerings =
    catalog?.offerings.filter(
      (item) =>
        item.kind === 'sports' &&
        (!gymnasiumOnly || item.code === 'basketball'),
    ) ?? [];
  const chosen =
    offerings.find(
      (item) =>
        item.code === court ||
        item.resources?.some((resource) => resource.code === court),
    ) ?? offerings[0];
  const rule = catalog?.rules.find((item) => item.kind === 'sports');
  const effectiveDuration =
    rule &&
    (duration < rule.minMinutes ||
      duration > rule.maxMinutes ||
      duration % rule.stepMinutes)
      ? rule.minMinutes
      : duration;
  const today = manilaDate();
  const latest = rule?.advanceDays
    ? shiftDate(today, rule.advanceDays)
    : rule?.advanceMonths
      ? addCalendarMonths(today, rule.advanceMonths)
      : today;
  const availability = useAvailability(
    chosen?.code,
    date,
    effectiveDuration,
    !!rule && !!date && date >= today && date <= latest && !receipt,
  );
  const result = availability.result;
  const slot = result?.slots.find((item) => item.startsAt === selected);
  const selectedTaken = !!selected && !!slot && !slot.available;
  const summarySession = receipt ?? quote ?? slot;
  function reset() {
    setSelected('');
    setQuote(null);
    setReceipt(null);
    setError('');
  }
  async function getQuote() {
    if (!chosen || !slot?.canRequest) return;
    setBusy('quote');
    setError('');
    setQuote(null);
    try {
      const value = await api<QuoteData>('/booking/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringCode: chosen.code,
          startsAt: slot.startsAt,
          durationMinutes: effectiveDuration,
          promoCode: promo || undefined,
          equipment: Object.entries(rentals)
            .filter(([, quantity]) => quantity > 0)
            .map(([id, quantity]) => ({ id, quantity })),
        }),
      });
      setQuote(value);
      requestKey.current = crypto.randomUUID();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to quote this session',
      );
    } finally {
      setBusy('');
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote) return;
    if (selectedTaken) {
      setError(
        'Someone has held or booked this court and time. Choose another available session.',
      );
      return;
    }
    const values = new FormData(event.currentTarget);
    requestDetails.current = {
      quoteId: quote.id,
      fullName: values.get('name'),
      email: values.get('email'),
      mobile: values.get('mobile'),
      players: Number(values.get('players')),
      notes: values.get('notes') || undefined,
      policyId: quote.policy.id,
      acceptedTerms: values.get('accepted') === 'on',
    };
    setError('');
    setPaymentOpen(true);
  }
  async function choosePayment(paymentMethod: 'qr' | 'cash') {
    if (!quote || !requestDetails.current || receipt || busy) return;
    setBusy('request');
    setError('');
    try {
      setReceipt(
        await api<ReservationReceipt>('/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Reservation-Token': quote.token,
            'Idempotency-Key': requestKey.current,
          },
          body: JSON.stringify({ ...requestDetails.current, paymentMethod }),
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to submit your request.',
      );
    } finally {
      setBusy('');
    }
  }
  async function refreshStatus() {
    if (!quote || !receipt) return;
    setBusy('status');
    try {
      setReceipt(
        await api<ReservationReceipt>(`/reservations/${receipt.reference}`, {
          headers: { 'X-Reservation-Token': quote.token },
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to check request status',
      );
    } finally {
      setBusy('');
    }
  }
  const email = emailLink('Sports session enquiry — Jomeca Center', [
    'Hello Jomeca team,',
    `Court: ${chosen?.name ?? 'To discuss'}`,
    `Preferred date: ${date || 'To discuss'}`,
    `Preferred time: ${slot ? sessionTime(slot.startsAt, slot.endsAt) : 'To discuss'}`,
    `Duration: ${effectiveDuration} minutes`,
    'Please confirm the approved rates and booking arrangements. This enquiry does not reserve a court.',
  ]);
  return (
    <div className="sports-reservations-page">
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="booking-payment-dialog">
          <DialogTitle>
            {receipt ? 'Your reservation and payment' : 'Choose how to pay'}
          </DialogTitle>
          <DialogDescription>
            {receipt
              ? `Reference: ${receipt.reference}. Payment verification and booking approval are separate.`
              : 'Your request creates a temporary hold after you choose a payment method. No payment is made by this website.'}
          </DialogDescription>
          {error && (
            <p role="alert" className="admin-alert">
              {error}
            </p>
          )}
          {!receipt && quote && (
            <>
              <div className="payment-choice-total">
                <span>Total for this session</span>
                <strong>{money(quote.totalCentavos)}</strong>
              </div>
              <div className="payment-method-options">
                {(catalog?.paymentMethods ?? ['qr']).includes('qr') && (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => void choosePayment('qr')}
                  >
                    <QrCode size={28} />
                    <strong>QR payment</strong>
                    <span>
                      Scan the payment QR in your banking app, then upload your
                      receipt.
                    </span>
                  </button>
                )}
                {catalog?.paymentMethods?.includes('cash') && (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => void choosePayment('cash')}
                  >
                    <Banknote size={28} />
                    <strong>Cash at the counter</strong>
                    <span>
                      Download your ticket and pay within the{' '}
                      {quote.holdMinutes}-minute hold, before the session
                      starts.
                    </span>
                  </button>
                )}
              </div>
              {busy && (
                <p role="status">Creating your pending reservation...</p>
              )}
            </>
          )}
          {receipt && quote && (
            <>
              <p className="payment-reference">
                {receipt.reference} | {receipt.status} |{' '}
                {receipt.paymentStatus.replaceAll('_', ' ')}
              </p>
              <PaymentPanel
                key={`${receipt.status}/${receipt.paymentStatus}/${receipt.holdUntil}`}
                reference={receipt.reference}
                token={quote.token}
                onChange={() => void refreshStatus()}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      <PageHeading
        label={gymnasiumOnly ? 'Gymnasium' : 'Reservations'}
        title={
          gymnasiumOnly
            ? 'Reserve the gymnasium.'
            : 'Make time for your next game.'
        }
      >
        Pick your sport, choose a date, and see times update automatically.
        Every reservation request still needs staff approval.
      </PageHeading>
      <section className="wrap page-section">
        {!catalog?.requestsEnabled && (
          <Notice title="Online reservation requests are not open yet">
            <p>
              You can check the court schedule below. Requests stay closed until
              required rates and policies are configured. Availability is
              advisory and does not hold a court.
            </p>
          </Notice>
        )}
        {error && (
          <p className="admin-alert" role="alert">
            {error}
          </p>
        )}
        {!catalog && !error && (
          <p role="status">Loading court and booking information…</p>
        )}
        {catalog && rule && chosen && (
          <div className="planning-grid">
            <div>
              <div className="planning-form sports-planner-shell">
                <SportsPlanner
                  offerings={offerings}
                  chosen={chosen}
                  rule={rule}
                  date={date}
                  minDate={today}
                  maxDate={latest}
                  duration={effectiveDuration}
                  selected={selected}
                  result={result}
                  loading={availability.loading}
                  error={availability.error}
                  disabled={!!busy || !!receipt}
                  onCourt={(value) => {
                    if (
                      !gymnasiumOnly &&
                      (value === 'basketball' || value === 'basketball-hall')
                    ) {
                      navigate('/gymnasium');
                      return;
                    }
                    setCourt(value);
                    reset();
                  }}
                  onDate={(value) => {
                    setDate(value);
                    reset();
                  }}
                  onDuration={(value) => {
                    setDuration(value);
                    reset();
                  }}
                  onTime={(value) => {
                    setSelected(value);
                    setQuote(null);
                    setError('');
                  }}
                  onRetry={availability.retry}
                />
              </div>
              {quote && !receipt && (
                <form className="planning-form customer-form" onSubmit={submit}>
                  <h2>Your request details</h2>
                  <p className="field-hint">
                    A request holds the court for {quote.holdMinutes} minutes.
                    It is not a confirmed booking and does not verify payment.
                  </p>
                  <fieldset disabled={!!busy} className="booking-fieldset">
                    <label className="field-label" htmlFor="full-name">
                      Full name
                    </label>
                    <input
                      id="full-name"
                      name="name"
                      required
                      minLength={2}
                      maxLength={120}
                      autoComplete="name"
                    />
                    <div className="field-grid">
                      <div>
                        <label className="field-label" htmlFor="booking-email">
                          Email address
                        </label>
                        <input
                          id="booking-email"
                          name="email"
                          type="email"
                          required
                          maxLength={254}
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor="booking-mobile">
                          Mobile number
                        </label>
                        <input
                          id="booking-mobile"
                          name="mobile"
                          type="tel"
                          required
                          maxLength={30}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <label className="field-label" htmlFor="players">
                      Number of players
                    </label>
                    <input
                      id="players"
                      name="players"
                      type="number"
                      min={1}
                      max={500}
                      required
                    />
                    <label className="field-label" htmlFor="booking-notes">
                      Notes (optional)
                    </label>
                    <textarea
                      id="booking-notes"
                      name="notes"
                      rows={3}
                      maxLength={1000}
                    />
                    <details className="policy-draft">
                      <summary>Booking terms · {quote.policy.version}</summary>
                      <p className="policy-copy">{quote.policy.terms}</p>
                    </details>
                    <details className="policy-draft">
                      <summary>Privacy notice · {quote.policy.version}</summary>
                      <p className="policy-copy">{quote.policy.privacy}</p>
                    </details>
                    <label className="consent-check">
                      <input name="accepted" type="checkbox" required />I have
                      read and accept this version of the booking terms and
                      privacy notice.
                    </label>
                    <Button type="submit" disabled={!!busy}>
                      {busy === 'request'
                        ? 'Submitting…'
                        : 'Continue to payment'}{' '}
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </Button>
                  </fieldset>
                </form>
              )}
            </div>
            <aside className="planning-summary">
              <div className="session-summary-hero">
                <StockPhoto kind={courtSport(chosen.code)} sizes="350px" />
                <div>
                  <p className="section-label">03 / Your preferred session</p>
                  <h2>{chosen.name}</h2>
                </div>
              </div>
              <p className="session-planning-badge">
                {receipt
                  ? 'Request recorded · See status below'
                  : 'Planning only · No court held'}
              </p>
              <ol
                className="session-progress"
                aria-label="Session selection progress"
              >
                <li data-complete="true">Court</li>
                <li data-complete={!!date}>Date</li>
                <li data-complete={!!summarySession}>Time</li>
              </ol>
              <div className="summary-line">
                <CalendarDays size={20} aria-hidden="true" />
                <span>{preferredDateLabel(date)}</span>
              </div>
              <div className="summary-line">
                <Clock3 size={20} aria-hidden="true" />
                <span>
                  {summarySession
                    ? sessionTime(
                        summarySession.startsAt,
                        summarySession.endsAt,
                      )
                    : 'Choose a start time'}
                  <small>
                    {durationLabel(effectiveDuration)} · Philippine time
                  </small>
                </span>
              </div>
              {catalog.equipment.length > 0 && (
                <fieldset
                  disabled={!!busy || !!receipt}
                  className="booking-fieldset"
                >
                  <h3 className="rental-heading">Optional rentals</h3>
                  {catalog.equipment.map((item) => (
                    <label key={item.id} className="rental-choice">
                      <span>
                        {item.name}
                        <small>
                          {money(item.hourlyCentavos!)} / item / hour
                        </small>
                      </span>
                      <input
                        aria-label={`${item.name} quantity`}
                        type="number"
                        min={0}
                        max={50}
                        value={rentals[item.id] ?? 0}
                        onChange={(event) => {
                          setRentals({
                            ...rentals,
                            [item.id]: Number(event.target.value),
                          });
                          setQuote(null);
                        }}
                      />
                    </label>
                  ))}
                </fieldset>
              )}
              {!catalog.equipment.length && (
                <p className="field-hint">
                  Rental prices and availability are being configured. Contact
                  our team about equipment.
                </p>
              )}
              <label className="field-label" htmlFor="promo-code">
                Promo code (optional)
              </label>
              <input
                className="summary-input"
                id="promo-code"
                value={promo}
                maxLength={40}
                disabled={!!busy || !!receipt}
                onChange={(event) => {
                  setPromo(event.target.value.toUpperCase());
                  setQuote(null);
                }}
              />
              <div className="price-pending">
                <span>{quote ? 'Quoted total' : 'Court price'}</span>
                <strong>
                  {quote
                    ? money(quote.totalCentavos)
                    : slot?.totalCentavos !== null &&
                        slot?.totalCentavos !== undefined
                      ? money(slot.totalCentavos)
                      : 'To be announced'}
                </strong>
              </div>
              {quote && (
                <>
                  <div className="quote-lines">
                    {quote.lines.map((line, n) => (
                      <div key={`${line.label}-${n}`}>
                        <span>{line.label}</span>
                        <span>{money(line.amountCentavos)}</span>
                      </div>
                    ))}
                    {quote.discountCentavos > 0 && (
                      <div>
                        <span>Promotion</span>
                        <span>−{money(quote.discountCentavos)}</span>
                      </div>
                    )}
                  </div>
                  <p className="field-hint">
                    Quote valid until {time(quote.expiresAt)}. Availability and
                    cutoff are rechecked before submission.
                  </p>
                </>
              )}
              {!receipt && (
                <Button
                  className="w-full"
                  type="button"
                  disabled={!slot?.canRequest || !!busy}
                  onClick={() => void getQuote()}
                >
                  {busy === 'quote'
                    ? 'Calculating…'
                    : !catalog.requestsEnabled || !!result?.issues.length
                      ? 'Requests unavailable — setup pending'
                      : !date
                        ? 'Choose a date'
                        : !slot
                          ? 'Choose a start time'
                          : slot.canRequest
                            ? 'Get a price quote'
                            : 'This session cannot be requested'}
                </Button>
              )}
              {!slot?.canRequest && !receipt && (
                <p className="field-hint">
                  No payment is due here. You can discuss a preferred session
                  with our team.
                </p>
              )}
              {selectedTaken && !receipt && (
                <Notice title="Selected session unavailable">
                  This court and time is no longer available. Another request
                  may be holding it. Choose a different time or court; your
                  quote did not reserve the slot.
                </Notice>
              )}
              {slot && !slot.canRequest && !receipt && (
                <a className="text-link" href={email}>
                  Ask about this session{' '}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              )}
              {receipt && (
                <div className="review-result" role="status">
                  <strong>
                    {receipt.status === 'pending'
                      ? 'Request received — not confirmed'
                      : `Request ${receipt.status}`}
                  </strong>
                  <p>
                    Reference: <strong>{receipt.reference}</strong>
                  </p>
                  <p>{receipt.message}</p>
                  {receipt.holdUntil && (
                    <p>
                      Hold ends{' '}
                      {new Date(receipt.holdUntil).toLocaleString('en-PH', {
                        timeZone: 'Asia/Manila',
                      })}{' '}
                      (Manila).
                    </p>
                  )}
                  <p>
                    Payment status: {receipt.paymentStatus}. Save your reference
                    and private access token to return later.
                  </p>
                  {quote && (
                    <>
                      <label className="ops-field">
                        Private access token
                        <input readOnly value={quote.token} />
                      </label>
                      <Link to="/reservation-status">
                        Return to reservation status
                      </Link>
                      <Button
                        type="button"
                        onClick={() => setPaymentOpen(true)}
                      >
                        Payment and ticket
                      </Button>
                      {!paymentOpen && (
                        <PaymentPanel
                          key={`${receipt.status}/${receipt.paymentStatus}/${receipt.holdUntil}`}
                          reference={receipt.reference}
                          token={quote.token}
                          onChange={() => void refreshStatus()}
                        />
                      )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    type="button"
                    disabled={!!busy}
                    onClick={() => void refreshStatus()}
                  >
                    Refresh request status
                  </Button>
                </div>
              )}
              <a href={site.phoneHref} className="summary-contact">
                <MessageCircle size={18} aria-hidden="true" />
                Or call {site.phone}
              </a>
            </aside>
          </div>
        )}
        <p className="small-note">
          Planning a gathering instead?{' '}
          <Link to="/gymnasium">Explore the gymnasium</Link>.
        </p>
      </section>
    </div>
  );
}
