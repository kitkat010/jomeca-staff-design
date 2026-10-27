import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import {
  Search,
  ChevronRight,
  ListFilter,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import type {
  StaffSession,
  OperationRow,
  OperationDetail,
  PaymentConfiguration,
  BookingCatalog,
  EventEnquiryData,
} from '@jomeca/shared';
import { api } from '@/lib/api';
import { StaffRequestReview } from '@/components/staff-request-review';
import { money, centavosFromInput as parseCentavos } from '@/lib/money';
import { manilaDate, shiftDate } from '@/lib/planning';
import { Button } from '@/components/ui/button';

const stamp = (s: string) =>
  new Date(s).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
const field = (f: FormData, key: string) => String(f.get(key) ?? '').trim();
const optionalNumber = (f: FormData, k: string) =>
  field(f, k) === '' ? null : Number(field(f, k));
function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="ops-field">
      {label}
      <input {...props} />
    </label>
  );
}
function Reason() {
  return (
    <label className="ops-field">
      Reason for this change
      <textarea
        name="reason"
        minLength={5}
        maxLength={1000}
        required
        rows={2}
      />
    </label>
  );
}

function CompactMenu({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target))
        menu.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return (
    <details
      ref={menu}
      className="ops-compact-menu"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          menu.current?.removeAttribute('open');
          menu.current?.querySelector('summary')?.focus();
        }
      }}
    >
      {children}
    </details>
  );
}

export function OperationsPage() {
  const [sort, setSort] = useState('priority');
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [channelKind, setChannelKind] = useState<'qr' | 'cash' | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [session, setSession] = useState<StaffSession | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(true);
  const [tab, setTab] = useState('Calendar'),
    [from, setFrom] = useState(manilaDate()),
    [to, setTo] = useState(shiftDate(manilaDate(), 6)),
    [rows, setRows] = useState<OperationRow[]>([]),
    [detail, setDetail] = useState<OperationDetail | null>(null);
  const [config, setConfig] = useState<PaymentConfiguration | null>(null),
    [catalog, setCatalog] = useState<BookingCatalog | null>(null),
    [enquiries, setEnquiries] = useState<EventEnquiryData[]>([]),
    [enquiry, setEnquiry] = useState<EventEnquiryData | null>(null),
    [channel, setChannel] = useState(''),
    [handoff, setHandoff] = useState<{
      reference: string;
      token: string;
      holdUntil: string;
    } | null>(null);
  const manualKey = useRef(crypto.randomUUID());
  const detailPanel = useRef<HTMLDivElement>(null);
  const selectedReference = detail?.reference;
  useEffect(() => {
    if (selectedReference) {
      detailPanel.current?.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
      detailPanel.current?.focus({ preventScroll: true });
    }
  }, [selectedReference]);
  const [loadedRange, setLoadedRange] = useState('');
  useEffect(() => {
    if (
      !loadedRange ||
      tab !== 'Calendar' ||
      !session?.user.permissions.includes('booking.read')
    )
      return;
    const [start, end] = loadedRange.split('/');
    const controller = new AbortController();
    let active = true,
      pending = false;
    const refresh = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const data = await api<{ reservations: OperationRow[] }>(
          `/admin/reservations?from=${start}&to=${end}`,
          { signal: controller.signal },
        );
        if (active) setRows(data.reservations);
      } catch {
        /* Keep the last queue snapshot; explicit refresh reports errors. */
      } finally {
        pending = false;
      }
    };
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
  }, [loadedRange, tab, session]);
  const [paymentChannels, setPaymentChannels] = useState<
    { id: string; name: string; active: boolean }[]
  >([]);
  useEffect(() => {
    if (!session?.user.permissions.includes('booking.read')) return;
    let alive = true;
    const requestedStart = searchParams.get('from') ?? '';
    const start =
      /^\d{4}-\d{2}-\d{2}$/.test(requestedStart) &&
      Number.isFinite(Date.parse(`${requestedStart}T12:00:00Z`))
        ? requestedStart
        : manilaDate();
    const end = searchParams.get('to') || shiftDate(start, 6);
    const requestedTab = searchParams.get('tab');
    const allowedTabs = [
      'Calendar',
      ...(session.user.permissions.includes('booking.manage')
        ? ['Event enquiries', 'Manual hold']
        : []),
      ...(session.user.permissions.includes('settings.write')
        ? ['Payment settings']
        : []),
    ];
    const reference = searchParams.get('reference');
    Promise.all([
      api<{ reservations: OperationRow[] }>(
        `/admin/reservations?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`,
      ),
      reference
        ? api<OperationDetail>(
            `/admin/reservations/${encodeURIComponent(reference)}`,
          )
        : Promise.resolve(null),
    ])
      .then(([data, selected]) => {
        if (alive) {
          setTab(
            requestedTab && allowedTabs.includes(requestedTab)
              ? requestedTab
              : 'Calendar',
          );
          setFrom(start);
          setTo(end);
          setError('');
          setRows(data.reservations);
          setLoadedRange(`${start}/${end}`);
          setDetail(selected);
        }
      })
      .catch((e) => {
        if (alive)
          setError(
            e instanceof Error ? e.message : 'Unable to load reservations',
          );
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [session, searchParams]);
  useEffect(() => {
    if (
      tab !== 'Event enquiries' ||
      !session?.user.permissions.includes('booking.manage')
    )
      return;
    let alive = true;
    api<{ enquiries: EventEnquiryData[] }>('/admin/event-enquiries')
      .then((value) => {
        if (alive) setEnquiries(value.enquiries);
      })
      .catch((e) => {
        if (alive)
          setError(e instanceof Error ? e.message : 'Unable to load enquiries');
      });
    return () => {
      alive = false;
    };
  }, [session, tab]);
  useEffect(() => {
    if (!session?.user.permissions.includes('payment.review')) return;
    let alive = true;
    api<{ channels: { id: string; name: string; active: boolean }[] }>(
      '/admin/payments/channels',
    )
      .then((v) => {
        if (alive) setPaymentChannels(v.channels);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [session, config]);
  const can = (p: StaffSession['user']['permissions'][number]) =>
    session?.user.permissions.includes(p) ?? false;
  useEffect(() => {
    let alive = true;
    api<StaffSession>('/auth/session')
      .then((s) => {
        if (alive) setSession(s);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    let alive = true;
    api<BookingCatalog>('/booking/catalog')
      .then((v) => {
        if (alive) setCatalog(v);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    if (session.user.permissions.includes('settings.write'))
      api<PaymentConfiguration>('/admin/payments/config')
        .then((v) => {
          if (alive) setConfig(v);
        })
        .catch((e) => {
          if (alive) setError(e.message);
        });
    return () => {
      alive = false;
    };
  }, [session]);
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to complete this action',
      );
    } finally {
      setBusy(false);
    }
  }
  const headers = {
    'Content-Type': 'application/json',
    'x-csrf-token': session?.csrfToken ?? '',
  };
  async function post<T>(path: string, data: unknown, method = 'POST') {
    return api<T>(path, { method, headers, body: JSON.stringify(data) });
  }
  async function loadCalendar() {
    const v = await api<{ reservations: OperationRow[] }>(
      `/admin/reservations?from=${from}&to=${to}`,
    );
    setRows(v.reservations);
    setLoadedRange(`${from}/${to}`);
  }
  async function openRow(reference: string) {
    await run(async () => {
      setDetail(await api<OperationDetail>(`/admin/reservations/${reference}`));
    });
  }
  async function loadEnquiries() {
    const v = await api<{ enquiries: EventEnquiryData[] }>(
      '/admin/event-enquiries',
    );
    setEnquiries(v.enquiries);
  }
  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!config) return;
    await run(async () => {
      await post(
        '/admin/payments/settings',
        {
          revision: config.settings.revision,
          reason: field(f, 'reason'),
          mode: field(f, 'mode') || null,
          depositPercent: optionalNumber(f, 'deposit'),
          balanceBeforeMinutes: optionalNumber(f, 'balance'),
          proofExtendsHold:
            field(f, 'extends') === '' ? null : field(f, 'extends') === 'yes',
          reviewMinutes: optionalNumber(f, 'review'),
          cancellationText: field(f, 'cancellation') || null,
          reschedulingText: field(f, 'rescheduling') || null,
        },
        'PUT',
      );
      setConfig(await api<PaymentConfiguration>('/admin/payments/config'));
      setNotice('Payment policies saved with an audit entry.');
    });
  }
  async function saveChannel(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!config) return;
    await run(async () => {
      const file = f.get('qr');
      let qrBase64: string | undefined;
      if (file instanceof File && file.size) {
        if (file.size > 5 * 1024 * 1024)
          throw new Error('QR image must be no larger than 5 MB.');
        qrBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]!);
          reader.onerror = () => reject(new Error('Unable to read image'));
          reader.readAsDataURL(file);
        });
      }
      await post('/admin/payments/channels', {
        revision: config.settings.revision,
        reason: field(f, 'reason'),
        ...(channel ? { id: channel } : {}),
        name: field(f, 'name'),
        kind: field(f, 'kind'),
        accountName:
          field(f, 'kind') === 'cash'
            ? 'Jomeca Center counter'
            : field(f, 'accountName'),
        accountNumber:
          field(f, 'kind') === 'cash' ? 'CASH' : field(f, 'accountNumber'),
        instructions: field(f, 'instructions'),
        active: f.get('active') === 'on',
        ...(qrBase64 ? { qrBase64 } : {}),
      });
      setConfig(await api<PaymentConfiguration>('/admin/payments/config'));
      setChannel('');
      setNotice('Payment channel saved.');
    });
  }
  async function manual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      const totalCentavos = parseCentavos(field(f, 'amount'));
      if (totalCentavos === null)
        throw new Error('Enter an approved quote amount.');
      const v = await post<{
        reference: string;
        token: string;
        holdUntil: string;
      }>('/admin/manual-holds', {
        idempotencyKey: manualKey.current,
        reason: field(f, 'reason'),
        offeringCode: field(f, 'offering'),
        startsAt: new Date(`${field(f, 'startsAt')}:00+08:00`).toISOString(),
        durationMinutes: Number(field(f, 'duration')),
        totalCentavos,
        holdMinutes: Number(field(f, 'hold')),
        ...(enquiry ? { enquiryId: enquiry.id } : {}),
        fullName: field(f, 'name'),
        email: field(f, 'email'),
        mobile: field(f, 'mobile'),
        policyId: catalog?.policy?.id,
        consentRecorded: f.get('consent') === 'on',
        overrideTiming: f.get('override') === 'on',
      });
      setHandoff(v);
      manualKey.current = crypto.randomUUID();
      setNotice(
        'Pending hold created. Payment verification and approval remain required.',
      );
    });
  }
  if (loading)
    return (
      <p className="wrap page-section" role="status">
        Checking staff session…
      </p>
    );
  if (!session)
    return (
      <section className="wrap page-section">
        <h1>Reservation operations</h1>
        <p>Sign in to continue.</p>
        <Link to="/staff">Staff sign in</Link>
      </section>
    );
  if (!can('booking.read'))
    return (
      <p className="wrap page-section">You do not have reservation access.</p>
    );
  if (searchParams.get('tab') === 'Reports')
    return (
      <Navigate
        to={`/staff/reports?${new URLSearchParams({ from, to })}`}
        replace
      />
    );
  const chosenChannel = config?.channels.find((c) => c.id === channel);
  const matchingRows = rows
    .filter(
      (row) =>
        ['pending', 'confirmed'].includes(row.status) &&
        (statusFilter === 'all' ||
          row.status ===
            (statusFilter === 'reserved' ? 'confirmed' : 'pending')) &&
        `${row.customerName ?? ''} ${row.reference} ${row.offering.name}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) => {
      const dateOrder =
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      if (sort === 'name')
        return (
          (a.customerName ?? '').localeCompare(b.customerName ?? '') ||
          a.reference.localeCompare(b.reference)
        );
      if (sort === 'latest')
        return -dateOrder || a.reference.localeCompare(b.reference);
      return (
        (sort === 'priority'
          ? Number(b.status === 'pending') - Number(a.status === 'pending')
          : 0) ||
        dateOrder ||
        a.reference.localeCompare(b.reference)
      );
    });
  const pages = Math.max(1, Math.ceil(matchingRows.length / 8));
  const currentPage = Math.min(page, pages);
  async function presetRange(days: number) {
    const start = manilaDate(),
      end = shiftDate(start, days - 1);
    await run(async () => {
      const data = await api<{ reservations: OperationRow[] }>(
        `/admin/reservations?from=${start}&to=${end}`,
      );
      setFrom(start);
      setTo(end);
      setRows(data.reservations);
      setLoadedRange(`${start}/${end}`);
      setPage(1);
    });
  }
  return (
    <section className="wrap page-section operations">
      <div className="ops-heading">
        <div>
          <p className="section-label">Staff workspace</p>
          <h1>Reservations</h1>
          <p>Review payment, then approve or reject pending requests.</p>
        </div>
        <Link to="/staff">Staff account</Link>
      </div>
      {error && (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="ops-notice">
          {notice}
        </p>
      )}
      {tab === 'Calendar' && (
        <>
          <>
            {!detail && (
              <div
                className="staff-card staff-reservation-list"
                aria-label="Reservation schedule"
              >
                <div className="staff-card-heading ops-list-heading">
                  <div>
                    <h2>Reservations</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    aria-label="Refresh reservations"
                    onClick={() => void run(loadCalendar)}
                  >
                    <RefreshCw size={15} />
                  </Button>
                </div>
                <div className="staff-table-toolbar ops-compact-toolbar">
                  <form
                    className="ops-unified-search"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const reference = search.trim().toUpperCase();
                      if (/^JMC-[A-Z0-9-]+$/.test(reference))
                        void openRow(reference);
                    }}
                  >
                    <Search size={17} aria-hidden="true" />
                    <input
                      aria-label="Search reservations"
                      placeholder="Search guest, court or ticket reference…"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                    <button
                      type="submit"
                      aria-label="Find exact ticket across all dates"
                      disabled={busy}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </form>
                  <CompactMenu>
                    <summary
                      className="ops-icon-filter ops-icon-date"
                      aria-label="Filter by session dates"
                      title="Filter by session dates"
                    >
                      <CalendarDays size={18} aria-hidden="true" />
                    </summary>
                    <div className="ops-menu-panel ops-date-panel">
                      <strong>Session dates</strong>
                      <div className="ops-range-presets">
                        {[
                          [1, 'Today'],
                          [7, 'Next 7 days'],
                          [30, 'Next 30 days'],
                        ].map(([days, label]) => (
                          <Button
                            key={days}
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void presetRange(Number(days))}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          setPage(1);
                          void run(loadCalendar);
                        }}
                      >
                        <Field
                          label="From date"
                          name="from"
                          type="date"
                          value={from}
                          onChange={(event) => setFrom(event.target.value)}
                          required
                        />
                        <Field
                          label="Through date"
                          name="to"
                          type="date"
                          value={to}
                          onChange={(event) => setTo(event.target.value)}
                          required
                        />
                        <Button size="sm" disabled={busy}>
                          Apply dates
                        </Button>
                      </form>
                    </div>
                  </CompactMenu>
                  <CompactMenu>
                    <summary
                      className="ops-icon-filter ops-icon-sort"
                      aria-label="Filter and sort reservations"
                      title="Filter and sort reservations"
                    >
                      <ListFilter size={18} aria-hidden="true" />
                    </summary>
                    <div className="ops-menu-panel ops-sort-panel">
                      <div
                        className="ops-menu-group"
                        role="group"
                        aria-label="Reservation status"
                      >
                        <strong>Status</strong>
                        {['pending', 'reserved', 'all'].map((value) => (
                          <label key={value}>
                            <input
                              type="radio"
                              name="compact-status"
                              aria-label={
                                value === 'all'
                                  ? 'Pending and reserved'
                                  : value === 'reserved'
                                    ? 'Reserved'
                                    : 'Pending'
                              }
                              value={value}
                              checked={statusFilter === value}
                              onChange={(event) => {
                                setStatusFilter(value);
                                setPage(1);
                                event.currentTarget
                                  .closest('details')
                                  ?.removeAttribute('open');
                              }}
                            />
                            {value === 'all'
                              ? 'Pending and reserved'
                              : value === 'reserved'
                                ? 'Reserved'
                                : 'Pending'}
                          </label>
                        ))}
                      </div>
                      <div
                        className="ops-menu-group"
                        role="group"
                        aria-label="Sort order"
                      >
                        <strong>Sort by</strong>
                        {[
                          ['priority', 'Pending first'],
                          ['earliest', 'Earliest session'],
                          ['latest', 'Latest session'],
                          ['name', 'Guest name'],
                        ].map(([value, label]) => (
                          <label key={value}>
                            <input
                              type="radio"
                              name="compact-sort"
                              aria-label={label}
                              value={value}
                              checked={sort === value}
                              onChange={(event) => {
                                setSort(value!);
                                setPage(1);
                                event.currentTarget
                                  .closest('details')
                                  ?.removeAttribute('open');
                              }}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </CompactMenu>
                </div>
                <p className="ops-search-hint">
                  Search this date range. Enter a full ticket reference and
                  press Enter to find it across all dates.
                </p>
                <div className="staff-table-scroll">
                  <table className="staff-table ops-refined-table">
                    <thead>
                      <tr>
                        <th scope="col">Guest</th>
                        <th scope="col">Court</th>
                        <th scope="col">Schedule · Manila</th>
                        <th scope="col">Status</th>
                        <th scope="col">Payment</th>
                        <th scope="col">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchingRows
                        .slice((currentPage - 1) * 8, currentPage * 8)
                        .map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong
                                className="ops-guest-name"
                                title={r.customerName ?? 'Guest'}
                              >
                                {r.customerName ?? 'Guest'}
                              </strong>
                              <small>{r.reference}</small>
                            </td>
                            <td>
                              <strong>{r.offering.name}</strong>
                              <small>
                                {r.totalCentavos === null
                                  ? 'Unconfigured'
                                  : money(r.totalCentavos)}
                              </small>
                            </td>
                            <td>
                              <strong>{stamp(r.startsAt)}</strong>
                              <small>
                                Until {stamp(r.endsAt)}
                                {r.checkedInAt ? ' · Checked in' : ''}
                              </small>
                            </td>
                            <td>
                              <span
                                className={`staff-badge status-${r.status}`}
                              >
                                {r.status === 'confirmed'
                                  ? 'Reserved'
                                  : 'Pending'}
                              </span>
                            </td>
                            <td>
                              <span className="staff-payment-status">
                                {r.paymentStatus.replaceAll('_', ' ')}
                              </span>
                              {r.needsResolution && (
                                <small className="staff-warning">
                                  Needs resolution
                                </small>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                aria-label={`Review ${r.reference}`}
                                onClick={() => void openRow(r.reference)}
                              >
                                Open
                                <ChevronRight size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {matchingRows.length === 0 && (
                  <div className="staff-empty">
                    <strong>
                      {busy
                        ? 'Loading reservations…'
                        : 'No matching reservations'}
                    </strong>
                    <p>Try another search, status or date range.</p>
                  </div>
                )}
                <div className="ops-table-footer">
                  <span>
                    {matchingRows.length
                      ? `${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, matchingRows.length)} of ${matchingRows.length}`
                      : '0 results'}
                  </span>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage <= 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span>
                      {currentPage} / {pages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage >= pages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {detail && (
              <div ref={detailPanel} tabIndex={-1}>
                <StaffRequestReview
                  key={`${detail.reference}/${detail.operationRevision}`}
                  detail={detail}
                  channels={paymentChannels}
                  csrfToken={session.csrfToken}
                  canManage={can('booking.manage')}
                  canReviewPayment={can('payment.review')}
                  onBack={() => setDetail(null)}
                  onRefresh={() => openRow(detail.reference)}
                  onChanged={async (value) => {
                    setDetail(value);
                    await loadCalendar();
                  }}
                />
              </div>
            )}
          </>
        </>
      )}
      {tab === 'Event enquiries' && (
        <>
          <Button disabled={busy} onClick={() => void run(loadEnquiries)}>
            Load enquiries
          </Button>
          <p>
            Enquiries do not hold the hall. Up to the latest 100 are listed.
          </p>
          <div className="ops-calendar">
            {enquiries.map((e) => (
              <article className="ops-booking" key={e.id}>
                <h2>{e.occasion}</h2>
                <p>
                  {e.reference} · {e.status}
                </p>
                <p>
                  {e.customerName} · {e.preferredDate} · {e.durationMinutes}{' '}
                  minutes
                </p>
                <p>{e.notes}</p>
                <Button
                  disabled={e.status !== 'new'}
                  onClick={() => {
                    setEnquiry(e);
                    setTab('Manual hold');
                  }}
                >
                  Prepare quoted hold
                </Button>
              </article>
            ))}
          </div>
        </>
      )}
      {tab === 'Manual hold' && (
        <>
          <p>
            Record a walk-in/phone request or an event quote. Holds remain
            pending and unpaid until verified and approved. Quoted amounts are
            explicitly entered by authorized management.
          </p>
          <form
            key={enquiry?.id ?? 'manual'}
            className="planning-form"
            onSubmit={manual}
          >
            <label className="ops-field">
              Offering
              <select
                name="offering"
                defaultValue={enquiry ? 'event-venue' : ''}
                required
              >
                <option value="">Choose a court or venue</option>
                {catalog?.offerings.map((o) => (
                  <option key={o.id} value={o.code}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            {enquiry && (
              <p>
                From enquiry {enquiry.reference}. Contact details must match the
                enquiry.
              </p>
            )}
            <Field
              label="Full name"
              name="name"
              defaultValue={enquiry?.customerName}
              maxLength={120}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={enquiry?.customerEmail}
              required
            />
            <Field
              label="Mobile"
              name="mobile"
              defaultValue={enquiry?.customerMobile}
              required
            />
            <Field
              label="Start (Manila)"
              name="startsAt"
              type="datetime-local"
              required
            />
            <Field
              label="Duration (minutes)"
              name="duration"
              type="number"
              min={1}
              max={720}
              defaultValue={enquiry?.durationMinutes}
              required
            />
            <Field
              label="Approved quote (PHP)"
              name="amount"
              inputMode="decimal"
              required
            />
            <Field
              label="Hold duration (minutes; sports at most 30)"
              name="hold"
              type="number"
              min={1}
              max={10080}
              required
            />
            <label className="consent-check">
              <input name="consent" type="checkbox" required />I recorded
              customer acceptance of published policy{' '}
              {catalog?.policy?.version ?? '(not configured)'}.
            </label>
            <label className="consent-check">
              <input name="override" type="checkbox" />
              Authorize cutoff/advance-window override; physical conflicts are
              never bypassed.
            </label>
            <Reason />
            <Button disabled={busy || !catalog?.policy}>
              Create pending hold
            </Button>
          </form>
          {enquiry && (
            <Button variant="outline" onClick={() => setEnquiry(null)}>
              Clear event enquiry
            </Button>
          )}
          {handoff && (
            <div className="planning-form">
              <h2>Private customer handoff</h2>
              <p>
                Reference: {handoff.reference} · Hold until{' '}
                {stamp(handoff.holdUntil)}
              </p>
              <label className="ops-field">
                Private access token
                <input readOnly value={handoff.token} />
              </label>
              <p>
                Provide these details privately to the customer for{' '}
                <Link to="/reservation-status">
                  reservation status and payment
                </Link>
                . The token is shown only in this session.
              </p>
            </div>
          )}
        </>
      )}
      {tab === 'Payment settings' && config && (
        <>
          <form
            className="planning-form"
            key={`policy-${config.settings.revision}`}
            onSubmit={saveSettings}
          >
            <h2>Payment and review policies</h2>
            <p>
              Full payment and a configurable review extension are selected. The
              review duration remains unconfigured until approved. Saving these
              settings does not open public intake.
            </p>
            <label className="ops-field">
              Payment requirement
              <select name="mode" defaultValue={config.settings.mode ?? ''}>
                <option value="">Unconfigured</option>
                <option value="full">Full payment</option>
                <option value="deposit">
                  Deposit (requires separate approval)
                </option>
              </select>
            </label>
            <Field
              label="Deposit percentage (deposit mode only)"
              name="deposit"
              type="number"
              min={1}
              max={99}
              defaultValue={config.settings.depositPercent ?? ''}
            />
            <Field
              label="Balance due minutes before start (deposit only)"
              name="balance"
              type="number"
              min={0}
              defaultValue={config.settings.balanceBeforeMinutes ?? ''}
            />
            <label className="ops-field">
              First proof extends hold
              <select
                name="extends"
                defaultValue={
                  config.settings.proofExtendsHold === null
                    ? ''
                    : config.settings.proofExtendsHold
                      ? 'yes'
                      : 'no'
                }
              >
                <option value="">Unconfigured</option>
                <option value="yes">Yes, for staff review</option>
                <option value="no">No extension</option>
              </select>
            </label>
            <Field
              label="Review extension minutes"
              name="review"
              type="number"
              min={1}
              max={10080}
              defaultValue={config.settings.reviewMinutes ?? ''}
            />
            <label className="ops-field">
              Approved cancellation instructions
              <textarea
                name="cancellation"
                minLength={10}
                maxLength={3000}
                defaultValue={config.settings.cancellationText ?? ''}
              />
            </label>
            <label className="ops-field">
              Approved rescheduling instructions
              <textarea
                name="rescheduling"
                minLength={10}
                maxLength={3000}
                defaultValue={config.settings.reschedulingText ?? ''}
              />
            </label>
            <Reason />
            <Button disabled={busy}>Save payment policies</Button>
          </form>
          <label className="ops-field">
            Edit payment channel
            <select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                setChannelKind(null);
              }}
            >
              <option value="">New channel</option>
              {config.channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.active ? '' : ' (inactive)'}
                </option>
              ))}
            </select>
          </label>
          <form
            className="planning-form"
            key={`${channel}-${config.settings.revision}`}
            onSubmit={saveChannel}
          >
            <h2>
              {chosenChannel ? 'Edit payment channel' : 'New payment channel'}
            </h2>
            {chosenChannel && <p>Channel ID: {chosenChannel.id}</p>}
            <Field
              label="Channel name"
              name="name"
              defaultValue={chosenChannel?.name}
              maxLength={80}
              required
            />
            <label className="ops-field">
              Payment method
              <select
                name="kind"
                value={channelKind ?? chosenChannel?.kind ?? 'qr'}
                onChange={(e) =>
                  setChannelKind(e.target.value as 'qr' | 'cash')
                }
              >
                <option value="qr">QR / bank / wallet</option>
                <option value="cash">Cash at the counter</option>
              </select>
            </label>
            {(channelKind ?? chosenChannel?.kind ?? 'qr') === 'qr' && (
              <>
                <Field
                  label="Account name"
                  name="accountName"
                  defaultValue={chosenChannel?.accountName}
                  maxLength={120}
                  required
                />
                <Field
                  label="Account number"
                  name="accountNumber"
                  defaultValue={chosenChannel?.accountNumber}
                  maxLength={100}
                  required
                />
              </>
            )}
            <label className="ops-field">
              Payment instructions
              <textarea
                name="instructions"
                minLength={5}
                maxLength={1500}
                defaultValue={chosenChannel?.instructions}
                required
              />
            </label>
            <Field
              label={
                chosenChannel?.hasQr
                  ? 'Replace QR image (optional)'
                  : 'QR image (optional)'
              }
              name="qr"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
            <label className="consent-check">
              <input
                name="active"
                type="checkbox"
                defaultChecked={chosenChannel?.active}
              />
              Activate after verifying account and QR details.
            </label>
            <Reason />
            <Button disabled={busy}>Save payment channel</Button>
          </form>
        </>
      )}
    </section>
  );
}
