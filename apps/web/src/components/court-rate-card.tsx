// Adapted from Shadcn Space card-24 (MIT). See THIRD_PARTY_NOTICES.md.
import { ArrowUpRight, CalendarDays, Clock3, ImageIcon } from 'lucide-react';
import type { OfferingData, RateData } from '@jomeca/shared';
import { StockPhoto } from '@/components/stock-photo';
import { money } from '@/lib/money';

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const time = (minute: number) =>
  `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export function CourtRateCard({
  rate,
  offering,
  onEdit,
}: {
  rate: RateData;
  offering: OfferingData | undefined;
  onEdit: () => void;
}) {
  const code = offering?.code ?? '';
  const image = code.startsWith('pickleball')
    ? 'pickleball'
    : code === 'badminton'
      ? 'badminton'
      : code === 'basketball'
        ? 'basketball'
        : offering?.kind === 'events'
          ? 'gymnasium'
          : null;
  return (
    <button
      type="button"
      className="court-rate-card"
      onClick={onEdit}
      aria-label={`Edit rate ${rate.name} for ${offering?.name ?? 'court'}`}
    >
      <span className="court-rate-card-media">
        {image ? (
          <StockPhoto
            kind={image}
            sizes="(max-width: 650px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <span className="court-rate-card-placeholder">
            <ImageIcon size={35} aria-hidden="true" />
          </span>
        )}
        <span
          className={`court-rate-card-state ${rate.active ? 'is-active' : ''}`}
        >
          <i />
          {rate.active ? 'Active' : 'Inactive'}
        </span>
      </span>
      <span className="court-rate-card-body">
        <strong className="court-rate-card-title">
          {offering?.name ?? 'Court'}
        </strong>
        <span className="court-rate-card-name">{rate.name}</span>
        <span className="court-rate-card-details">
          <span>
            <CalendarDays size={15} aria-hidden="true" />
            {rate.weekday === null ? 'Every day' : days[rate.weekday]}
          </span>
          <span>
            <Clock3 size={15} aria-hidden="true" />
            {time(rate.startMinute)} –{' '}
            {rate.endMinute === 1440 ? '00:00 next day' : time(rate.endMinute)}
          </span>
        </span>
        <span className="court-rate-card-footer">
          <span className="court-rate-card-price">
            <strong>{money(rate.hourlyCentavos)}</strong>
            <small>per hour</small>
          </span>
          <span className="court-rate-card-action">
            Edit rate <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </span>
      </span>
    </button>
  );
}
