import { Check, CalendarDays, Clock3, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  AvailabilityResult,
  BookingRuleData,
  OfferingData,
  VenueCalendar,
} from '@jomeca/shared';
import { CalendarTwo } from '@/components/shadcn-space/calendar/calendar-02';
import { CalendarThree } from '@/components/shadcn-space/calendar/calendar-03';
import { StockPhoto } from '@/components/stock-photo';
import { manilaDate } from '@/lib/planning';
import { money } from '@/lib/money';
import { api } from '@/lib/api';

const sports = [
  { key: 'pickleball', label: 'Pickleball' },
  { key: 'basketball', label: 'Gymnasium' },
  { key: 'badminton', label: 'Badminton' },
] as const;
export function courtSport(code: string) {
  return (
    sports.find((sport) => code.startsWith(sport.key))?.key ?? 'basketball'
  );
}
export function durationLabel(minutes: number) {
  return minutes % 60 === 0
    ? `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'}`
    : `${minutes} minutes`;
}
export function preferredDateLabel(date: string) {
  return date
    ? new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(`${date}T12:00:00+08:00`))
    : 'Choose a date';
}
const time = (date: string) =>
  new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

export function SportsPlanner({
  offerings,
  chosen,
  rule,
  date,
  minDate,
  maxDate,
  duration,
  selected,
  result,
  loading,
  error,
  disabled,
  onCourt,
  onDate,
  onDuration,
  onTime,
  onRetry,
}: {
  offerings: OfferingData[];
  chosen: OfferingData;
  rule: BookingRuleData;
  date: string;
  minDate: string;
  maxDate: string;
  duration: number;
  selected: string;
  result: AvailabilityResult | null;
  loading: boolean;
  error: string;
  disabled: boolean;
  onCourt: (court: string) => void;
  onDate: (date: string) => void;
  onDuration: (minutes: number) => void;
  onTime: (time: string) => void;
  onRetry: () => void;
}) {
  const sport = courtSport(chosen.code);
  const courts = offerings.filter((item) => courtSport(item.code) === sport);
  const [month, setMonth] = useState(() => (date || minDate).slice(0, 7));
  const calendarKey = `${chosen.code}/${month}`;
  const [calendar, setCalendar] = useState<{
    key: string;
    data?: VenueCalendar;
    error?: string;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const query = new URLSearchParams({ offeringCode: chosen.code, month });
        const data = await api<VenueCalendar>(
          `/booking/court-calendar?${query}`,
          {
            signal: controller.signal,
          },
        );
        if (active) setCalendar({ key: calendarKey, data });
      } catch {
        if (active)
          setCalendar({
            key: calendarKey,
            error:
              'Court occupancy could not be refreshed. Check the schedule before requesting.',
          });
      } finally {
        pending = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [chosen.code, month, calendarKey]);
  const currentCalendar = calendar?.key === calendarKey ? calendar : null;
  return (
    <div className="sports-planner">
      <div className="planner-court-panel">
        <p className="planner-step">01 / Choose your game</p>
        <fieldset
          className="booking-fieldset sport-card-fieldset"
          disabled={disabled}
        >
          <legend className="sr-only">Choose a sport</legend>
          <div className="sport-choice-cards">
            {sports.map((item) => {
              const options = offerings.filter(
                (offering) => courtSport(offering.code) === item.key,
              );
              return (
                options.length > 0 && (
                  <label
                    key={item.key}
                    className={`sport-choice-card ${sport === item.key ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="sport"
                      value={item.key}
                      checked={sport === item.key}
                      onChange={() => onCourt(options[0]!.code)}
                    />
                    <span className="sport-choice-photo" aria-hidden="true">
                      <StockPhoto kind={item.key} sizes="80px" />
                    </span>
                    <span className="sport-choice-copy">
                      <strong>{item.label}</strong>
                      <small>
                        {options.length}{' '}
                        {options.length === 1 ? 'court' : 'courts'}
                      </small>
                    </span>
                    <Check
                      size={17}
                      className="sport-choice-check"
                      aria-hidden="true"
                    />
                  </label>
                )
              );
            })}
          </div>
        </fieldset>
        <fieldset
          className="booking-fieldset court-chip-fieldset"
          disabled={disabled}
        >
          <legend>
            {courts.length > 1 ? 'Pick your court' : 'Your court'}
          </legend>
          <div className="court-choice-chips">
            {courts.map((item) => (
              <label key={item.code} className="court-choice-chip">
                <input
                  type="radio"
                  name="court"
                  value={item.code}
                  checked={chosen.code === item.code}
                  onChange={() => onCourt(item.code)}
                />
                <span>{item.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="planner-stock-note">Stock imagery · Not Jomeca Center</p>
      </div>
      <div className="planner-calendar-panel">
        <p className="planner-step">02 / Make time for play</p>
        <CalendarThree
          calendar={
            <>
              <h2 className="planner-panel-heading">
                <CalendarDays size={17} aria-hidden="true" />
                Preferred date
              </h2>
              <CalendarTwo
                value={date}
                min={minDate}
                max={maxDate}
                disabled={disabled}
                onChange={onDate}
                month={new Date(`${month}-01T12:00:00+08:00`)}
                onMonthChange={(value) =>
                  setMonth(manilaDate(value).slice(0, 7))
                }
                busyDates={currentCalendar?.data?.days
                  .filter((day) => day.busy.length > 0)
                  .map((day) => day.date)}
              />
              <p className="event-calendar-legend">
                <i aria-hidden="true" />
                Yellow circle: this court has a hold, booking or block. Other
                times may still be available.
              </p>
              <p className="planner-timezone" role="status">
                {currentCalendar?.error ??
                  (currentCalendar?.data
                    ? 'Court occupancy refreshes every 10 seconds.'
                    : 'Checking court occupancy…')}
              </p>
              <fieldset
                className="booking-fieldset duration-fieldset"
                disabled={disabled}
              >
                <legend>
                  <Clock3 size={15} aria-hidden="true" />
                  Duration
                </legend>
                <div className="duration-choices">
                  {Array.from(
                    {
                      length:
                        Math.floor(
                          (rule.maxMinutes - rule.minMinutes) /
                            rule.stepMinutes,
                        ) + 1,
                    },
                    (_, n) => rule.minMinutes + n * rule.stepMinutes,
                  ).map((minutes) => (
                    <label key={minutes}>
                      <input
                        type="radio"
                        name="duration"
                        value={minutes}
                        checked={duration === minutes}
                        onChange={() => onDuration(minutes)}
                      />
                      <span>{durationLabel(minutes)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="planner-timezone">Philippine time · Asia/Manila</p>
            </>
          }
          times={
            <section aria-label="Court schedule" aria-busy={loading}>
              <h2 className="planner-panel-heading">Choose a start time</h2>
              <p className="planner-date-caption">{preferredDateLabel(date)}</p>
              <p className="schedule-live-note" role="status">
                {loading
                  ? 'Updating schedule…'
                  : error
                    ? 'Schedule could not be loaded.'
                    : !date
                      ? 'Select a date to see times.'
                      : result
                        ? `${result.slots.filter((slot) => slot.available).length} available start times · ${chosen.name}`
                        : 'Waiting for the schedule…'}
              </p>
              {error && (
                <div className="schedule-error">
                  <p role="alert">{error}</p>
                  <button type="button" onClick={onRetry} disabled={disabled}>
                    <RefreshCw size={15} aria-hidden="true" />
                    Retry schedule
                  </button>
                </div>
              )}
              {!date && (
                <div className="schedule-placeholder">
                  <CalendarDays size={28} aria-hidden="true" />
                  <p>Your next game starts with a date.</p>
                  <small>
                    Times update automatically when your choices change.
                  </small>
                </div>
              )}
              {result && (
                <>
                  {result.issues.length > 0 && (
                    <details className="availability-issues">
                      <summary>Booking setup details</summary>
                      <ul>
                        {result.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="slot-grid">
                    {result.slots.map((item) => (
                      <button
                        key={item.startsAt}
                        type="button"
                        className="slot-button"
                        aria-pressed={selected === item.startsAt}
                        disabled={!item.available || disabled}
                        onClick={() => onTime(item.startsAt)}
                      >
                        <span className="slot-time-range">
                          <strong>
                            <time dateTime={item.startsAt}>
                              {time(item.startsAt)}
                            </time>
                          </strong>
                          <span className="slot-end-time">
                            <span aria-hidden="true">→ </span>
                            <span className="sr-only">Ends </span>
                            <time dateTime={item.endsAt}>
                              {time(item.endsAt)}
                            </time>
                            {manilaDate(new Date(item.endsAt)) >
                              manilaDate(new Date(item.startsAt)) &&
                              ' (next day)'}
                          </span>
                        </span>
                        <span>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                        <small>
                          {item.available && item.totalCentavos === null
                            ? 'Rates pending'
                            : (item.reason ??
                              (item.totalCentavos !== null
                                ? money(item.totalCentavos)
                                : 'Price pending'))}
                        </small>
                      </button>
                    ))}
                  </div>
                  {!result.slots.length && (
                    <p className="empty-slots">
                      No sessions match this date and duration within the
                      opening hours and cutoff. Try another date or a shorter
                      session.
                    </p>
                  )}
                </>
              )}
            </section>
          }
        />
        <p className="planner-policy-note">
          Current cutoff: {rule.cutoffMinutes} minutes before start. Schedule
          checks do not hold a court. All rules are checked again when a request
          is submitted.
          {date && date < manilaDate()
            ? ' Please choose a current or future date.'
            : ''}
        </p>
      </div>
    </div>
  );
}
