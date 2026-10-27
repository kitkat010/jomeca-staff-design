import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { OpeningHourData } from '@jomeca/shared';

const time = (minute: number) =>
  `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export function WeeklyHoursRow({
  day,
  label,
}: {
  day: OpeningHourData;
  label: string;
}) {
  const [open, setOpen] = useState(!day.closed);
  const [opens, setOpens] = useState(time(day.opensMinute));
  const [closes, setCloses] = useState(time(day.closesMinute));
  const [overnight, setOvernight] = useState(day.closesMinute >= 1440);
  return (
    <div className="weekly-hours-row" data-closed={!open || undefined}>
      <div className="weekly-hours-day">
        <button
          type="button"
          role="switch"
          aria-checked={open}
          aria-label={`${label} open for bookings`}
          className="weekly-hours-switch"
          onClick={() => setOpen(!open)}
        >
          <span />
        </button>
        <strong>{label}</strong>
        <span className="weekly-hours-state">{open ? 'Open' : 'Closed'}</span>
      </div>
      {!open && (
        <input type="hidden" name={`closed${day.weekday}`} value="on" />
      )}
      {overnight && (
        <input type="hidden" name={`next${day.weekday}`} value="on" />
      )}
      {!open && <span className="weekly-hours-closed">Closed all day</span>}
      <div className="weekly-hours-times" hidden={!open}>
        <label>
          <span className="sr-only">{label} opening time</span>
          <input
            type="time"
            name={`open${day.weekday}`}
            value={opens}
            onChange={(event) => setOpens(event.target.value)}
            readOnly={!open}
            required={open}
          />
        </label>
        <ArrowRight size={15} aria-hidden="true" />
        <label>
          <span className="sr-only">{label} closing time</span>
          <input
            type="time"
            name={`close${day.weekday}`}
            value={closes}
            onChange={(event) => setCloses(event.target.value)}
            readOnly={!open}
            required={open}
          />
        </label>
        <button
          type="button"
          className="weekly-hours-overnight"
          aria-pressed={overnight}
          aria-label={`${label} closes the next day`}
          title="Use +1 day when closing after midnight"
          onClick={() => setOvernight(!overnight)}
        >
          {overnight ? '+1 day' : 'Same day'}
        </button>
      </div>
    </div>
  );
}
