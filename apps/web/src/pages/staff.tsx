import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Wallet,
  RefreshCw,
  Search,
  ChevronRight,
  CircleAlert,
  Inbox,
  Activity,
} from 'lucide-react';
import type { EventEnquiryData, OperationRow } from '@jomeca/shared';
import { useStaffSession } from '@/components/staff-layout';
import { Button } from '@/components/ui/button';
import { StaffAnalytics } from '@/components/staff-analytics';
import { StaffStatusFilter } from '@/components/staff-status-filter';
import { api } from '@/lib/api';
import { manilaDate, shiftDate } from '@/lib/planning';
import { money } from '@/lib/money';
import {
  prioritizePending,
  summarizeReservations,
} from '@/lib/staff-dashboard';

const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
) =>
  new Date(`${date}T12:00:00+08:00`).toLocaleDateString('en-PH', {
    ...options,
    timeZone: 'Asia/Manila',
  });
const timeLabel = (date: string) =>
  new Date(date).toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
  });
export function StaffPage() {
  const session = useStaffSession();
  const navigate = useNavigate();
  const canRead = session.user.permissions.includes('booking.read');
  const canManage = session.user.permissions.includes('booking.manage');
  const [from, setFrom] = useState(manilaDate());
  const [rows, setRows] = useState<OperationRow[] | null>(null);
  const [enquiries, setEnquiries] = useState<EventEnquiryData[] | null>(null);
  const [error, setError] = useState('');
  const [enquiryError, setEnquiryError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const to = shiftDate(from, 6);
  useEffect(() => {
    let alive = true;
    if (!canRead) return;
    const controller = new AbortController();
    let running = false;
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      if (!alive || running) return;
      running = true;
      clearTimeout(timer);
      try {
        const data = await api<{ reservations: OperationRow[] }>(
          `/admin/reservations?from=${from}&to=${to}`,
          { signal: controller.signal },
        );
        if (alive) {
          setRows(data.reservations);
          setUpdatedAt(new Date());
          setError('');
        }
      } catch (e) {
        if (alive && !controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : 'Unable to load reservations.',
          );
      } finally {
        running = false;
        if (alive) {
          setLoading(false);
          timer = setTimeout(() => {
            if (!document.hidden) void load();
          }, 10000);
        }
      }
    }
    const resume = () => {
      if (!document.hidden) void load();
    };
    void load();
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(timer);
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [from, to, refresh, canRead]);
  useEffect(() => {
    let alive = true;
    if (canManage) {
      api<{ enquiries: EventEnquiryData[] }>('/admin/event-enquiries')
        .then((data) => {
          if (alive) setEnquiries(data.enquiries);
        })
        .catch(() => {
          if (alive) setEnquiryError('Event enquiries could not be loaded.');
        });
    }
    return () => {
      alive = false;
    };
  }, [canManage, refresh]);
  if (!canRead)
    return (
      <section className="staff-page-heading">
        <h1>Welcome, {session.user.name}</h1>
        <p>
          Your account does not have reservation access. Use the available
          sections in your workspace.
        </p>
      </section>
    );
  const summary = rows ? summarizeReservations(rows, from, 7) : null;
  const filtered = prioritizePending(rows ?? []).filter(
    (row) =>
      (filter === 'all' || row.status === filter) &&
      `${row.reference} ${row.offering.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  const currentPage = Math.min(page, pages);
  const visibleRows = filtered.slice((currentPage - 1) * 5, currentPage * 5);
  const stats = [
    {
      label: 'Reservations',
      value: summary?.total,
      icon: CalendarDays,
      note: 'Bookings in this date range',
      tone: 'mint',
    },
    {
      label: 'Reserved',
      value: summary?.confirmed,
      icon: CheckCircle2,
      note: 'Ready for their scheduled session',
      tone: 'blue',
    },
    {
      label: 'Pending holds',
      value: summary?.pending,
      icon: Clock3,
      note: 'Awaiting payment or approval',
      tone: 'amber',
    },
    {
      label: 'Net verified receipts',
      value: summary ? money(summary.receivedCentavos) : undefined,
      icon: Wallet,
      note: 'For bookings in this date range',
      tone: 'purple',
    },
  ];
  const openEnquiries = enquiries?.filter(
    (enquiry) => enquiry.status === 'new',
  );
  return (
    <section className="staff-dashboard">
      <div className="staff-page-heading">
        <div>
          <h1>Overview</h1>
        </div>
        <div className="staff-heading-actions">
          <Button
            variant="outline"
            onClick={() => {
              setLoading(true);
              setRows(null);
              setError('');
              setEnquiries(null);
              setEnquiryError('');
              setPage(1);
              setRefresh((value) => value + 1);
            }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'staff-spinning' : ''} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="staff-range">
        <div>
          <CalendarDays size={17} aria-hidden="true" />
          <strong>
            {dateLabel(from)} –{' '}
            {dateLabel(to, { month: 'short', day: 'numeric', year: 'numeric' })}
          </strong>
        </div>
        <label>
          Starting date
          <input
            aria-label="Dashboard starting date"
            type="date"
            value={from}
            required
            onChange={(event) => {
              if (event.target.value) {
                setLoading(true);
                setRows(null);
                setError('');
                setPage(1);
                setFrom(event.target.value);
              }
            }}
          />
        </label>
      </div>
      {error && (
        <p className="admin-alert" role="alert">
          {error} Use Refresh to try again.
        </p>
      )}
      {loading && (
        <span className="sr-only" role="status">
          Loading dashboard…
        </span>
      )}
      {/* Statistics composition adapted from Shadcn Space dashboard-shell-01. */}
      <div className="shell-statistics">
        <article className="staff-card shell-summary-card">
          <div>
            <h2>Booking overview</h2>
          </div>
          <div className="shell-summary-metrics">
            {[stats[0]!, stats[3]!].map(({ label, value }) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value ?? '—'}</strong>
              </div>
            ))}
          </div>
          <CalendarDays
            className="shell-summary-art"
            size={100}
            strokeWidth={1}
            aria-hidden="true"
          />
        </article>
        {[stats[1]!, stats[2]!].map(({ label, value, icon: Icon, tone }) => (
          <article className="staff-card shell-metric-card" key={label}>
            <div>
              <h2>{label}</h2>
              <span className={`staff-stat-icon ${tone}`}>
                <Icon size={19} aria-hidden="true" />
              </span>
            </div>
            <strong>{value ?? '—'}</strong>

            <Link
              to={`/staff/operations?from=${from}&to=${to}`}
              className="shell-report-link"
            >
              Open schedule <ArrowUpRight size={15} />
            </Link>
          </article>
        ))}
      </div>
      <StaffAnalytics
        summary={summary}
        from={from}
        to={to}
        loading={loading}
        canReport={session.user.permissions.includes('reports.read')}
      />
      <div className="staff-dashboard-grid">
        <article className="staff-card staff-reservations">
          <div className="staff-card-heading">
            <div>
              <h2>Reservations</h2>
            </div>
            <Link
              className="staff-text-link"
              to={`/staff/operations?from=${from}&to=${to}`}
            >
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="staff-table-toolbar">
            <label className="staff-search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label="Search reservations"
                placeholder="Search ticket number or activity…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <StaffStatusFilter
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
            />
          </div>
          <span className="sr-only" role="status">
            {updatedAt ? `Updated ${timeLabel(updatedAt.toISOString())}` : ''}
          </span>
          <div className="staff-table-scroll">
            <table className="staff-table staff-ticket-table">
              <thead>
                <tr>
                  <th scope="col">Ticket number</th>
                  <th scope="col">Activity</th>
                  <th scope="col">Schedule</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="staff-ticket-row"
                    onClick={(event) => {
                      if (
                        event.target instanceof Element &&
                        event.target.closest('a, button')
                      )
                        return;
                      navigate(
                        `/staff/operations?from=${from}&to=${to}&reference=${encodeURIComponent(row.reference)}`,
                      );
                    }}
                  >
                    <td>
                      <Link
                        className="staff-ticket-number"
                        aria-label={`Open ticket ${row.reference}`}
                        to={`/staff/operations?from=${from}&to=${to}&reference=${encodeURIComponent(row.reference)}`}
                      >
                        {row.reference}
                      </Link>
                    </td>
                    <td>{row.offering.name}</td>
                    <td>
                      <strong>
                        {dateLabel(manilaDate(new Date(row.startsAt)))}
                      </strong>
                      <small>
                        {timeLabel(row.startsAt)} – {timeLabel(row.endsAt)}
                      </small>
                    </td>
                    <td>
                      <span className={`staff-badge status-${row.status}`}>
                        {row.status === 'confirmed' ? 'Reserved' : row.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="staff-row-action"
                        aria-label={`Open reservation ${row.reference}`}
                        to={`/staff/operations?from=${from}&to=${to}&reference=${encodeURIComponent(row.reference)}`}
                      >
                        <ChevronRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!visibleRows.length && (
                  <tr>
                    <td colSpan={5}>
                      <div className="staff-empty">
                        <Inbox size={25} aria-hidden="true" />
                        <strong>
                          {loading
                            ? 'Loading reservations…'
                            : error
                              ? 'Reservations unavailable'
                              : 'No reservations found'}
                        </strong>
                        <p>
                          {search || filter !== 'all'
                            ? 'Try a different search or status filter.'
                            : 'Choose another starting date to explore the schedule.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="staff-pagination">
            <span>
              {filtered.length
                ? `${(currentPage - 1) * 5 + 1}–${Math.min(currentPage * 5, filtered.length)} of ${filtered.length}`
                : '0 reservations'}
            </span>
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span>
                {currentPage} / {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </article>
        <article className="staff-card staff-attention">
          <div className="staff-card-heading">
            <div>
              <h2>On your radar</h2>
            </div>
            <CircleAlert size={19} aria-hidden="true" />
          </div>
          <Link
            className="staff-attention-item"
            to={`/staff/operations?from=${from}&to=${to}`}
          >
            <span className="staff-stat-icon amber">
              <Wallet size={18} />
            </span>
            <div>
              <strong>Payment resolution</strong>
              <p>
                {summary
                  ? `${summary.resolution} bookings flagged in this range`
                  : 'Awaiting reservation data'}
              </p>
            </div>
            <ChevronRight size={16} />
          </Link>
          {canManage && (
            <Link
              className="staff-attention-item"
              to="/staff/operations?tab=Event+enquiries"
            >
              <span className="staff-stat-icon blue">
                <Inbox size={18} />
              </span>
              <div>
                <strong>Event enquiries</strong>
                <p>
                  {enquiryError ||
                    (openEnquiries
                      ? `${openEnquiries.length} new in the latest enquiries`
                      : 'Loading enquiries…')}
                </p>
              </div>
              <ChevronRight size={16} />
            </Link>
          )}
          {session.user.permissions.includes('notifications.manage') && (
            <Link className="staff-attention-item" to="/staff/notifications">
              <span className="staff-stat-icon mint">
                <Activity size={18} />
              </span>
              <div>
                <strong>Service health</strong>
                <p>Worker, email queue and backup status</p>
              </div>
              <ChevronRight size={16} />
            </Link>
          )}
        </article>
      </div>
    </section>
  );
}
