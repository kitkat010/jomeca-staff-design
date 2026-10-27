import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { BookingRuleData, VenueCalendar } from '@jomeca/shared';
import { api } from '@/lib/api';
import { manilaDate } from '@/lib/planning';
import { eventTimeWarnings } from '@/lib/event-time';

const CalendarTwo = lazy(() =>
  import('@/components/shadcn-space/calendar/calendar-02').then((m) => ({
    default: m.CalendarTwo,
  })),
);
export const timeText = (minute: number) =>
  minute === 1440
    ? '12:00 AM (next day)'
    : new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Manila',
      }).format(
        new Date(`2000-01-01T00:00:00+08:00`).getTime() + minute * 60000,
      );
const inputTime = (minute: number) =>
  `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export interface EventPlan {
  date: string;
  start: number;
  end: number;
  name: string;
  description: string;
}
export function EventPlanner({
  plan,
  onChange,
  min,
  max,
  rule,
  disabled,
  step,
  setStep,
  onValidity,
}: {
  plan: EventPlan;
  onChange: (plan: EventPlan) => void;
  min: string;
  max: string;
  rule?: BookingRuleData;
  disabled: boolean;
  step: number;
  setStep: (step: number) => void;
  onValidity: (valid: boolean) => void;
}) {
  const [month, setMonth] = useState(() => min.slice(0, 7));
  const [attempt, setAttempt] = useState(0);
  const wizardRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step)
      wizardRef.current?.querySelector<HTMLElement>('section h3')?.focus();
    previousStep.current = step;
  }, [step]);
  const query = useMemo(() => ({ month, attempt }), [month, attempt]);
  const [schedule, setSchedule] = useState<{
    query: typeof query;
    data?: VenueCalendar;
    error?: string;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let generation = 0;
    const refresh = () => {
      const revision = ++generation;
      void api<VenueCalendar>(`/booking/event-calendar?month=${query.month}`, {
        signal: controller.signal,
      })
        .then((data) => {
          if (active && revision === generation) setSchedule({ query, data });
        })
        .catch(() => {
          if (active && revision === generation)
            setSchedule({
              query,
              error:
                'The venue schedule could not be loaded. Retry before continuing.',
            });
        });
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [query]);
  const current = schedule?.query === query ? schedule : null;
  const day = current?.data?.days.find((day) => day.date === plan.date);
  const duration = plan.end - plan.start;
  const minDuration = rule?.minMinutes ?? 240,
    maxDuration = rule?.maxMinutes ?? 720,
    increment = rule?.stepMinutes ?? 60;
  const setup = current?.data?.setupMinutes,
    teardown = current?.data?.teardownMinutes;
  const warnings = eventTimeWarnings({
    start: plan.start,
    end: plan.end,
    minMinutes: minDuration,
    maxMinutes: maxDuration,
    increment,
    hours: day?.hours ?? [{ start: 0, end: 1440 }],
    conflicts: day?.conflicts ?? [],
  });
  if (current?.error)
    warnings.push(
      'The venue schedule could not be verified. Retry the schedule check before continuing.',
    );
  const problem = warnings.join(' ');
  const earliest = day?.hours.length
    ? Math.min(...day.hours.map((span) => span.start))
    : undefined;
  const latest = day?.hours.length
    ? Math.max(...day.hours.map((span) => span.end))
    : undefined;
  const valid =
    !!day &&
    plan.date >= min &&
    plan.date <= max &&
    !problem &&
    !current?.error;
  useEffect(() => onValidity(valid), [valid, onValidity]);
  const change = (patch: Partial<EventPlan>) => onChange({ ...plan, ...patch });
  const changeTime = (value: string, kind: 'start' | 'end') => {
    if (!value) return;
    const [h, m] = value.split(':').map(Number);
    const minutes = h! * 60 + m!;
    change(
      kind === 'start'
        ? { start: minutes }
        : { end: minutes === 0 ? 1440 : minutes },
    );
  };
  return (
    <div className="event-wizard" ref={wizardRef}>
      <nav aria-label="Event planning steps" className="event-step-nav">
        {['Date', 'Time', 'Details', 'Review'].map((title, index) => (
          <button
            type="button"
            key={title}
            aria-current={step === index ? 'step' : undefined}
            disabled={disabled || index > step}
            onClick={() => setStep(index)}
          >
            <span>0{index + 1}</span>
            {title}
          </button>
        ))}
      </nav>
      {step === 0 && (
        <section aria-labelledby="event-date-heading">
          <p className="section-label">01 / Choose your day</p>
          <h3 id="event-date-heading" tabIndex={-1}>
            When shall we get together?
          </h3>
          <p className="field-hint">
            Yellow rings mark days with occupied periods. A marked day may still
            have room for your event.
          </p>
          <Suspense fallback={<p role="status">Loading event calendar…</p>}>
            <CalendarTwo
              value={plan.date}
              min={min}
              max={max}
              disabled={disabled}
              month={new Date(`${month}-01T12:00:00+08:00`)}
              onMonthChange={(value) => setMonth(manilaDate(value).slice(0, 7))}
              busyDates={current?.data?.days
                .filter((day) => day.busy.length)
                .map((day) => day.date)}
              onChange={(date) => {
                setMonth(date.slice(0, 7));
                change({ date });
              }}
            />
          </Suspense>
          <p className="event-calendar-legend">
            <i aria-hidden="true" /> Occupied for part of the day · Shared
            gymnasium
          </p>
          {current?.data && (
            <p className="event-calendar-state" role="status">
              {current.data.days.some((day) => day.busy.length)
                ? `${current.data.days.filter((day) => day.busy.length).length} days have occupied periods this month. Select a date to see the times.`
                : 'No occupied periods recorded for this month. Staff still needs to confirm availability and setup time.'}
            </p>
          )}
          {!current && <p role="status">Checking venue calendar…</p>}
          {current?.error && (
            <p role="alert">
              {current.error}{' '}
              <button type="button" onClick={() => setAttempt((n) => n + 1)}>
                Retry schedule
              </button>
            </p>
          )}
          <button
            className="pill-button"
            type="button"
            disabled={!plan.date || !day || disabled}
            onClick={() => setStep(1)}
          >
            Choose event time →
          </button>
        </section>
      )}
      {step === 1 && (
        <section aria-labelledby="event-time-heading">
          <p className="section-label">02 / Find your time</p>
          <h3 id="event-time-heading" tabIndex={-1}>
            Make time for your occasion.
          </h3>
          <p className="field-hint">
            Drag either handle around the 24-hour clock, use the arrow keys, or
            type your time below.
          </p>
          <EventClock
            start={plan.start}
            end={plan.end}
            increment={increment}
            disabled={disabled}
            invalid={!!problem}
            warnings={warnings}
            onChange={(start, end) => change({ start, end })}
          />
          <p className="event-time-rules" id="event-time-rules">
            <strong>
              {minDuration / 60}–{maxDuration / 60} hours
            </strong>{' '}
            per event
            {earliest !== undefined && latest !== undefined && (
              <>
                <span aria-hidden="true"> · </span>
                {timeText(earliest)}–{timeText(latest)}
              </>
            )}
          </p>
          <div className="event-time-inputs">
            <label>
              Time in
              <input
                type="time"
                value={inputTime(plan.start)}
                step={increment * 60}
                min={earliest === undefined ? undefined : inputTime(earliest)}
                max={
                  latest === undefined ||
                  earliest === undefined ||
                  latest - minDuration < earliest
                    ? undefined
                    : inputTime(latest - minDuration)
                }
                aria-invalid={!!problem}
                aria-describedby={
                  problem
                    ? 'event-time-rules event-time-warning'
                    : 'event-time-rules'
                }
                onInput={(e) => changeTime(e.currentTarget.value, 'start')}
                onChange={(e) => changeTime(e.target.value, 'start')}
              />
            </label>
            <label>
              Time out
              <input
                type="time"
                value={inputTime(plan.end)}
                step={increment * 60}
                min={
                  plan.start + minDuration > 1440
                    ? undefined
                    : inputTime(plan.start + minDuration)
                }
                max={inputTime(
                  Math.min(latest ?? 1440, plan.start + maxDuration),
                )}
                aria-invalid={!!problem}
                aria-describedby={
                  problem
                    ? 'event-time-rules event-time-warning'
                    : 'event-time-rules'
                }
                onInput={(e) => changeTime(e.currentTarget.value, 'end')}
                onChange={(e) => changeTime(e.target.value, 'end')}
              />
            </label>
          </div>
          <p className="field-hint">
            {plan.end === 1440
              ? 'Midnight means 12:00 AM on the following day. '
              : ''}
            {duration > 0
              ? `${duration / 60} hours selected.`
              : 'Time out must follow time in.'}{' '}
            All times are Asia/Manila.
          </p>
          <div className="event-occupied">
            <h4>Venue schedule for {plan.date}</h4>
            {!day ? (
              <p role="status">
                Schedule unavailable.{' '}
                <button type="button" onClick={() => setAttempt((n) => n + 1)}>
                  Retry schedule
                </button>
              </p>
            ) : (
              <>
                <p>
                  Opening hours:{' '}
                  {day.hours.length
                    ? day.hours
                        .map(
                          (span) =>
                            `${timeText(span.start)}–${timeText(span.end)}`,
                        )
                        .join(', ')
                    : 'Closed'}
                </p>
                {day.busy.length ? (
                  <ul>
                    {day.busy.map((span) => (
                      <li key={span.start}>
                        <i aria-hidden="true" />
                        {timeText(span.start)}–{timeText(span.end)} · Held,
                        booked or blocked
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No occupied periods recorded for this day.</p>
                )}
              </>
            )}
          </div>
          <p className="field-hint">
            {setup == null || teardown == null
              ? 'Setup and teardown allowances are not configured. Staff must review these before any venue hold.'
              : `Additional venue time: ${setup} minutes setup and ${teardown} minutes teardown.`}{' '}
            Schedule checks do not hold the venue.
          </p>
          <button
            className="pill-button"
            type="button"
            disabled={!valid || disabled}
            onClick={() => setStep(2)}
          >
            Add event details →
          </button>
        </section>
      )}
      {step === 2 && (
        <section aria-labelledby="event-details-heading">
          <p className="section-label">03 / Bring your idea</p>
          <h3 id="event-details-heading" tabIndex={-1}>
            What are we celebrating?
          </h3>
          <label className="field-label" htmlFor="event-title-input">
            Name of event
          </label>
          <input
            id="event-title-input"
            maxLength={120}
            value={plan.name}
            onChange={(e) => change({ name: e.target.value })}
            placeholder="For example: Family celebration"
          />
          <label className="field-label" htmlFor="event-description">
            Event description
          </label>
          <textarea
            id="event-description"
            rows={5}
            maxLength={800}
            value={plan.description}
            onChange={(e) => change({ description: e.target.value })}
            placeholder="Tell us about your occasion, approximate guest count and setup ideas."
          />
          <p className="field-hint">
            Leave out payment details and sensitive personal information.
          </p>
          <button
            className="pill-button"
            type="button"
            disabled={
              !valid ||
              plan.name.trim().length < 2 ||
              !plan.description.trim() ||
              disabled
            }
            onClick={() => setStep(3)}
          >
            Review event enquiry →
          </button>
        </section>
      )}
      {step === 3 && (
        <section aria-labelledby="event-review-heading">
          <p className="section-label">04 / Check your plan</p>
          <h3 id="event-review-heading" tabIndex={-1}>
            Ready for the next conversation.
          </h3>
          <dl className="event-review-details">
            <div>
              <dt>Event</dt>
              <dd>{plan.name}</dd>
            </div>
            <div>
              <dt>Preferred date</dt>
              <dd>{plan.date}</dd>
            </div>
            <div>
              <dt>Preferred time</dt>
              <dd>
                {timeText(plan.start)}–{timeText(plan.end)}
              </dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>{plan.description}</dd>
            </div>
          </dl>
          {!valid && (
            <p role="alert">
              {problem ||
                'The schedule is unavailable. Return to the date step to refresh it.'}
            </p>
          )}
          <p className="field-hint">
            Proceed with an enquiry below. Staff must review the schedule, setup
            and teardown, quote and payment before a reservation can be
            confirmed.
          </p>
        </section>
      )}
    </div>
  );
}

function EventClock({
  start,
  end,
  increment,
  disabled,
  invalid,
  warnings,
  onChange,
}: {
  start: number;
  end: number;
  increment: number;
  disabled: boolean;
  invalid: boolean;
  warnings: string[];
  onChange: (start: number, end: number) => void;
}) {
  const [drag, setDrag] = useState<'start' | 'end' | null>(null);
  const point = (minute: number, radius = 100) => ({
    x: 140 + Math.sin((minute / 1440) * Math.PI * 2) * radius,
    y: 140 - Math.cos((minute / 1440) * Math.PI * 2) * radius,
  });
  const a = point(start),
    b = point(end);
  const move = (kind: 'start' | 'end', minute: number) =>
    onChange(
      kind === 'start'
        ? Math.min(1440 - increment, Math.max(0, minute))
        : start,
      kind === 'end' ? Math.min(1440, Math.max(increment, minute)) : end,
    );
  return (
    <div className={`event-clock${invalid ? ' is-invalid' : ''}`}>
      {invalid && (
        <div
          className="event-clock-warning"
          id="event-time-warning"
          role="alert"
        >
          <span className="event-warning-icon" aria-hidden="true">
            !
          </span>
          <strong aria-hidden="true">
            {warnings
              .map((warning) =>
                warning.includes('minimum duration')
                  ? warning.match(/minimum duration is (.+)\./)?.[1] +
                    ' minimum'
                  : warning.includes('maximum duration')
                    ? warning.match(/maximum duration is (.+)\./)?.[1] +
                      ' maximum'
                    : warning.includes('opening hours')
                      ? 'Outside opening hours'
                      : warning.includes('held, booked')
                        ? 'Time already occupied'
                        : warning.includes('closed on')
                          ? 'Venue closed on this day'
                          : warning.includes('increments')
                            ? 'Use the required time increments'
                            : warning.includes('later than')
                              ? 'Time out must follow time in'
                              : 'Schedule check needed',
              )
              .join(' · ')}
          </strong>
          <span className="sr-only">{warnings.join(' ')}</span>
        </div>
      )}
      <svg
        viewBox="0 0 280 280"
        role="group"
        aria-label="24-hour event time selector"
        onPointerMove={(e) => {
          if (!drag || disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const angle =
            (Math.atan2(
              e.clientX - rect.left - rect.width / 2,
              -(e.clientY - rect.top - rect.height / 2),
            ) +
              Math.PI * 2) %
            (Math.PI * 2);
          let minute =
            Math.round(((angle / (Math.PI * 2)) * 1440) / increment) *
            increment;
          if (drag === 'end' && minute === 0) minute = 1440;
          move(drag, minute);
        }}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <circle cx="140" cy="140" r="100" className="event-clock-track" />
        {end > start && (
          <path
            d={`M ${a.x} ${a.y} A 100 100 0 ${end - start > 720 ? 1 : 0} 1 ${b.x} ${b.y}`}
            className="event-clock-arc"
          />
        )}
        {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => {
          const p = point(hour * 60, 125);
          return (
            <text key={hour} x={p.x} y={p.y + 4} textAnchor="middle">
              {String(hour).padStart(2, '0')}
            </text>
          );
        })}
        <text x="140" y="134" textAnchor="middle" className="event-clock-total">
          {end > start ? `${(end - start) / 60}h` : '—'}
        </text>
        <text x="140" y="154" textAnchor="middle">
          EVENT TIME
        </text>
        {(['start', 'end'] as const).map((kind) => {
          const p = kind === 'start' ? a : b;
          return (
            <g key={kind}>
              <line
                x1="140"
                y1="140"
                x2={p.x}
                y2={p.y}
                className={`event-clock-hand ${kind}`}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="13"
                className={`event-clock-handle ${kind}`}
                role="slider"
                aria-label={
                  kind === 'start' ? 'Event start time' : 'Event end time'
                }
                aria-valuemin={kind === 'start' ? 0 : increment}
                aria-valuemax={kind === 'start' ? 1440 - increment : 1440}
                aria-valuenow={kind === 'start' ? start : end}
                aria-valuetext={timeText(kind === 'start' ? start : end)}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onPointerDown={(e) => {
                  if (disabled) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag(kind);
                }}
                onKeyDown={(e) => {
                  if (disabled) return;
                  if (
                    [
                      'ArrowRight',
                      'ArrowUp',
                      'ArrowLeft',
                      'ArrowDown',
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                    move(
                      kind,
                      (kind === 'start' ? start : end) +
                        (['ArrowRight', 'ArrowUp'].includes(e.key)
                          ? increment
                          : -increment),
                    );
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="event-clock-key">
        <span>● Time in</span>
        <span>● Time out</span>
      </div>
    </div>
  );
}
