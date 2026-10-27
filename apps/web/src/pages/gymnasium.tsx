import { Link, useSearchParams } from 'react-router';
import { Building2, CalendarDays } from 'lucide-react';
import { ReservationsPage } from '@/pages/reservations';
import { PrivateEventsPage } from '@/pages/private-events';

export function GymnasiumPage() {
  const [params] = useSearchParams();
  const events = params.get('use') === 'events';
  return (
    <>
      <nav className="wrap gymnasium-use-nav" aria-label="Gymnasium use">
        <Link to="/gymnasium" aria-current={!events ? 'page' : undefined}>
          <Building2 size={18} />
          Venue booking
        </Link>
        <Link
          to="/gymnasium?use=events"
          aria-current={events ? 'page' : undefined}
        >
          <CalendarDays size={18} />
          Event use
        </Link>
      </nav>
      {events ? <PrivateEventsPage /> : <ReservationsPage gymnasiumOnly />}
    </>
  );
}
