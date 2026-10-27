import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Download } from 'lucide-react';
import type { OperationRow } from '@jomeca/shared';
import { useStaffSession } from '@/components/staff-layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { money } from '@/lib/money';
import { manilaDate, shiftDate } from '@/lib/planning';

export function ReportsPage() {
  const session = useStaffSession();
  const [params] = useSearchParams();
  const initialFrom = /^\d{4}-\d{2}-\d{2}$/.test(params.get('from') ?? '')
    ? params.get('from')!
    : manilaDate();
  const initialTo = /^\d{4}-\d{2}-\d{2}$/.test(params.get('to') ?? '')
    ? params.get('to')!
    : shiftDate(initialFrom, 6);
  const [from, setFrom] = useState(initialFrom),
    [to, setTo] = useState(initialTo);
  const [range, setRange] = useState({ from: initialFrom, to: initialTo });
  const [report, setReport] = useState<{
    range: typeof range;
    rows: OperationRow[];
  } | null>(null);
  const [failure, setFailure] = useState<{
    range: typeof range;
    message: string;
  } | null>(null);
  const canRead = session.user.permissions.includes('reports.read');
  const canSummarize = session.user.permissions.includes('booking.read');
  const error = failure?.range === range ? failure.message : '';
  const loading =
    canRead &&
    canSummarize &&
    report?.range !== range &&
    failure?.range !== range;
  useEffect(() => {
    if (!canRead || !canSummarize) return;
    const controller = new AbortController();
    let active = true;
    void api<{ reservations: OperationRow[] }>(
      `/admin/reservations?${new URLSearchParams(range)}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (active) setReport({ range, rows: data.reservations });
      })
      .catch((e) => {
        if (active)
          setFailure({
            range,
            message:
              e instanceof Error ? e.message : 'Unable to load the report.',
          });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [range, canRead, canSummarize]);
  if (!canRead)
    return (
      <section className="wrap page-section">
        <h1>Reports</h1>
        <p>You do not have report access.</p>
      </section>
    );
  const rows = report?.rows ?? [];
  const totalsCurrent = report?.range === range && !loading && !error;
  const draftChanged = from !== range.from || to !== range.to;
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRange({ from, to });
  }
  return (
    <section className="wrap page-section operations">
      <div className="ops-heading">
        <div>
          <h1>Reports</h1>
          <p>Booking and payment summaries by session date.</p>
        </div>
      </div>
      <div className="staff-card reports-page-card">
        <h2>Booking and payment report</h2>
        <form className="ops-report-range" onSubmit={apply}>
          <label className="ops-field">
            From date
            <input
              name="from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              required
            />
          </label>
          <label className="ops-field">
            Through date
            <input
              name="to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              required
            />
          </label>
          <Button disabled={loading}>Apply dates</Button>
        </form>
        {loading && <p role="status">Loading report…</p>}
        {error && (
          <p role="alert" className="admin-alert">
            {error}
          </p>
        )}
        {canSummarize && report && (
          <div aria-busy={loading}>
            <div className="reports-summary">
              <div>
                <span>Bookings</span>
                <strong>{rows.length}</strong>
              </div>
              <div>
                <span>Quoted amount</span>
                <strong>
                  {money(
                    rows.reduce(
                      (sum, row) => sum + (row.totalCentavos ?? 0),
                      0,
                    ),
                  )}
                </strong>
              </div>
              <div>
                <span>Net verified receipts</span>
                <strong>
                  {money(rows.reduce((sum, row) => sum + row.paidCentavos, 0))}
                </strong>
              </div>
            </div>
            <p>
              {rows.filter((row) => row.needsResolution).length} bookings need
              payment resolution.
            </p>
            {rows.some((row) => row.totalCentavos === null) && (
              <p>Unconfigured quotes are excluded from the quoted amount.</p>
            )}
            <p className="staff-review-hint">
              Totals cover bookings within the loaded session dates, rather than
              receipts by transaction date.
            </p>
          </div>
        )}
        {!canSummarize && (
          <p>
            You can download this report. Contact your administrator for access
            to on-screen booking summaries.
          </p>
        )}
        {draftChanged && (
          <p className="staff-review-hint">
            Apply the changed dates before downloading their report.
          </p>
        )}
        {!draftChanged && (!canSummarize || totalsCurrent) && (
          <div className="reports-export-actions">
            <a
              className="pill-button reports-download"
              href='#' onClick={(event)=>{event.preventDefault();window.alert('Excel exports are available in the connected staff portal. This preview contains sample data only.');}}
            >
              <Download size={16} aria-hidden="true" />
              Download Excel report
            </a>
            <a
              className="reports-data-download"
              href='#' onClick={(event)=>{event.preventDefault();window.alert('Data exports are disabled in this design preview.');}}
            >
              Data Excel
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
