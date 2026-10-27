import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import {
  ArrowUpRight,
  CalendarDays,
  ArrowDown,
  MessageCircle,
  Sparkles,
  ClipboardCheck,
  Clock3,
} from 'lucide-react';
import { site } from '@/content/site';
import { eventGuidance } from '@/content/event-rules';
import { StockPhoto } from '@/components/stock-photo';
import { HomeReveals } from '@/components/home-reveals';
import { MotionText } from '@/components/home-motion';
import { Notice, ContactBand } from '@/components/public-ui';
import {
  manilaDate,
  shiftDate,
  addCalendarMonths,
  emailLink,
} from '@/lib/planning';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { BookingCatalog } from '@jomeca/shared';
import {
  EventPlanner,
  timeText,
  type EventPlan,
} from '@/components/event-planner';

export function PrivateEventsPage() {
  const [plan, setPlan] = useState<EventPlan>({
    date: '',
    start: 540,
    end: 780,
    name: '',
    description: '',
  });
  const [step, setStep] = useState(0);
  const [scheduleValid, setScheduleValid] = useState(false);
  const { date, name: occasion } = plan;
  const durationMinutes = plan.end - plan.start;
  const notes = `Preferred time: ${timeText(plan.start)}–${timeText(plan.end)} (Asia/Manila).\n${plan.description}`;
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<BookingCatalog | null>(null),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [reference, setReference] = useState('');
  const requestKey = useRef('');
  useEffect(() => {
    let alive = true;
    api<BookingCatalog>('/booking/catalog')
      .then((value) => {
        if (alive) setCatalog(value);
      })
      .catch(() => {
        /* The email enquiry remains available if online intake cannot be reached. */
      });
    return () => {
      alive = false;
    };
  }, []);
  const rule = catalog?.rules.find((item) => item.kind === 'events');
  const online = !!catalog?.requestsEnabled && !!catalog.policy;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !date ||
      step !== 3 ||
      !scheduleValid ||
      occasion.trim().length < 2 ||
      !plan.description.trim()
    ) {
      setError(
        'Complete the date, valid time range and event details before proceeding.',
      );
      return;
    }
    setError('');
    if (!online || !catalog?.policy) {
      setReady(true);
      return;
    }
    const values = new FormData(event.currentTarget);
    if (!requestKey.current) requestKey.current = crypto.randomUUID();
    setError('');
    setPending(true);
    try {
      const result = await api<{ reference: string; holdsInventory: false }>(
        '/event-enquiries',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': requestKey.current,
          },
          body: JSON.stringify({
            fullName: values.get('name'),
            email: values.get('email'),
            mobile: values.get('mobile'),
            policyId: catalog.policy.id,
            acceptedTerms: values.get('accepted') === 'on',
            preferredDate: date,
            durationMinutes,
            occasion,
            notes: notes || undefined,
          }),
        },
      );
      setReference(result.reference);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to send your enquiry',
      );
    } finally {
      setPending(false);
    }
  }
  const today = manilaDate();
  const minDate = shiftDate(
    today,
    Math.ceil((rule?.cutoffMinutes ?? 10080) / 1440),
  );
  const maxDate = rule?.advanceDays
    ? shiftDate(today, rule.advanceDays)
    : addCalendarMonths(today, rule?.advanceMonths ?? 12);
  const dateLabel = date
    ? new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(`${date}T12:00:00+08:00`))
    : 'Choose a preferred date';
  const email = emailLink('Private event enquiry — Jomeca Center', [
    'Hello Jomeca team,',
    `Occasion: ${occasion}`,
    `Preferred date: ${date || 'To discuss'}`,
    `Event duration: ${durationMinutes / 60} hours`,
    `Ideas / requirements: ${notes || 'To discuss'}`,
    '',
    'Please advise on availability, capacity, approved packages, setup/teardown, rates, and payment terms. I understand this is an enquiry and does not hold the venue.',
  ]);
  return (
    <HomeReveals className="private-events-reference">
      <section
        className="event-editorial-hero wrap"
        aria-labelledby="event-title"
      >
        <div className="event-editorial-copy">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Gymnasium</span>
          </nav>
          <p className="section-label">Beyond the game</p>
          <h1 id="event-title">
            <MotionText text="One gymnasium." />
            <br />
            <em>
              <MotionText text="Your occasion." />
            </em>
          </h1>
          <p>
            A celebration, a gathering, a reason to bring everyone together.
            Make a little room for your next shared moment.
          </p>
          <div className="event-hero-actions">
            <a className="pill-button light" href="#event-planner">
              Plan your occasion
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <a className="event-hero-phone" href={site.phoneHref}>
              Talk to our team
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="event-hero-fine">
            Enquiry first. Arrangements reviewed with our team.
          </p>
        </div>
        <figure className="event-editorial-photo">
          <StockPhoto kind="events" priority />
        </figure>
      </section>
      <section
        className="event-context wrap"
        data-home-reveal
        aria-labelledby="event-context-title"
      >
        <div>
          <p className="section-label">One space, more possibilities</p>
          <h2 id="event-context-title">
            <MotionText text="From the next game" />
            <br />
            <em>
              <MotionText text="to the next gathering." />
            </em>
          </h2>
          <p>
            Our gymnasium adapts to games and gatherings. Each occasion starts
            with a conversation about timing, setup and the details that matter
            to you.
          </p>
        </div>
        <dl>
          <div>
            <dt>Shared venue</dt>
            <dd>Gymnasium · Event use</dd>
          </div>
          <div>
            <dt>Packages, rates & capacity</dt>
            <dd>To be confirmed with our team</dd>
          </div>
          <div>
            <dt>Setup & teardown</dt>
            <dd>Reviewed separately from event time</dd>
          </div>
        </dl>
      </section>
      <section
        className="event-process wrap"
        aria-label="How event planning works"
        data-home-reveal
      >
        {[
          {
            icon: Sparkles,
            title: 'Start with your idea',
            copy: 'Choose an occasion, preferred date and event duration.',
          },
          {
            icon: MessageCircle,
            title: 'Share it with our team',
            copy: 'Discuss the schedule, guest count, layout and what you need.',
          },
          {
            icon: ClipboardCheck,
            title: 'Review the arrangements',
            copy: 'Staff confirms the details and any later quote or venue hold.',
          },
        ].map((step, index) => (
          <article key={step.title}>
            <div>
              <span>0{index + 1}</span>
              <step.icon size={23} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </article>
        ))}
      </section>
      <section
        className="wrap section event-planner-section"
        id="event-planner"
        aria-labelledby="event-planner-title"
      >
        <div className="section-heading" data-home-reveal>
          <div>
            <p className="section-label">Start a conversation</p>
            <h2 id="event-planner-title">
              <MotionText text="Tell us your idea." />
            </h2>
          </div>
          <p className="event-section-note">
            Start planning here. We’ll work through the details together.
          </p>
        </div>
        <Notice title="Enquiries only for now">
          <p>
            View occupied venue periods and plan your preferred schedule. This
            is an enquiry, not a venue hold. Rates, packages and setup
            allowances require staff confirmation.
          </p>
        </Notice>
        <div className="planning-grid">
          <form
            className="planning-form"
            onSubmit={(event) => void submit(event)}
            onChange={() => setReady(false)}
          >
            {error && (
              <p className="admin-alert" role="alert">
                {error}
              </p>
            )}
            <fieldset
              disabled={pending || !!reference}
              className="booking-fieldset"
            >
              <EventPlanner
                plan={plan}
                min={minDate}
                max={maxDate}
                rule={rule}
                disabled={pending || !!reference}
                step={step}
                setStep={(value) => {
                  setStep(value);
                  setReady(false);
                  setError('');
                }}
                onValidity={setScheduleValid}
                onChange={(value) => {
                  setPlan(value);
                  setReady(false);
                  setError('');
                  requestKey.current = '';
                }}
              />
              {step === 3 && online && catalog.policy && (
                <>
                  <label className="field-label" htmlFor="event-name">
                    Full name
                  </label>
                  <input
                    id="event-name"
                    name="name"
                    minLength={2}
                    maxLength={120}
                    required
                    autoComplete="name"
                  />
                  <div className="field-grid">
                    <div>
                      <label className="field-label" htmlFor="event-email">
                        Email address
                      </label>
                      <input
                        id="event-email"
                        type="email"
                        name="email"
                        maxLength={254}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="event-mobile">
                        Mobile number
                      </label>
                      <input
                        id="event-mobile"
                        type="tel"
                        name="mobile"
                        maxLength={30}
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                  <details className="policy-draft">
                    <summary>
                      Terms & privacy · {catalog.policy.version}
                    </summary>
                    <p className="policy-copy">{catalog.policy.terms}</p>
                    <p className="policy-copy">{catalog.policy.privacy}</p>
                  </details>
                  <label className="consent-check">
                    <input name="accepted" type="checkbox" required />I accept
                    these terms and the privacy notice for this enquiry.
                  </label>
                </>
              )}
              {step === 3 && (
                <Button
                  type="submit"
                  disabled={pending || !!reference || !scheduleValid}
                >
                  {pending
                    ? 'Submitting…'
                    : online
                      ? 'Send event enquiry'
                      : 'Proceed with event enquiry'}{' '}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Button>
              )}
            </fieldset>
            {reference && (
              <div className="review-result" role="status">
                <strong>Enquiry received: {reference}</strong>
                <p>
                  No venue hold or reservation has been created. Our team must
                  review the occasion, provide a quote, and arrange any later
                  hold.
                </p>
              </div>
            )}
            {ready && (
              <div className="review-result" role="status">
                <strong>Your enquiry is ready to discuss.</strong>
                <p>
                  Open your email app to review and send these details yourself.
                  Nothing has been booked or sent yet.
                </p>
                <a className="text-link" href={email}>
                  Open email enquiry{' '}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            )}
          </form>
          <aside className="event-help">
            <div className="event-idea-preview">
              <p className="section-label">Your occasion, at a glance</p>
              <Sparkles size={24} strokeWidth={1.4} aria-hidden="true" />
              <h2>{occasion || 'Your event plan'}</h2>
              <span>
                {reference
                  ? 'Enquiry received · No venue held'
                  : 'Planning only · No venue held'}
              </span>
            </div>
            <div className="event-preview-line">
              <CalendarDays size={18} aria-hidden="true" />
              <span>
                {dateLabel}
                <small>Philippine time · Asia/Manila</small>
              </span>
            </div>
            <div className="event-preview-line">
              <Clock3 size={18} aria-hidden="true" />
              <span>
                {date
                  ? `${timeText(plan.start)}–${timeText(plan.end)}`
                  : 'Choose your time next'}
                <small>
                  Event time; setup and teardown reviewed separately
                </small>
              </span>
            </div>
            <section
              className="event-rules-summary"
              aria-labelledby="event-rules-summary-title"
            >
              <p className="section-label">Before you proceed</p>
              <h3 id="event-rules-summary-title">A few event rules.</h3>
              <ul>
                {eventGuidance(rule).map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
              <p className="field-hint">
                Rates, setup allowances and final cancellation terms still
                require confirmation.
              </p>
              <Link
                className="event-rules-button"
                to="/faqs"
                target="_blank"
                rel="noopener noreferrer"
              >
                View full rules <ArrowUpRight size={17} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </section>
            <a href={site.phoneHref} className="text-link">
              Call {site.phone} <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <p className="small-note">
              Looking for a court session?{' '}
              <Link to="/reservations">Explore sports reservations</Link>.
            </p>
          </aside>
        </div>
      </section>
      <ContactBand />
    </HomeReveals>
  );
}
