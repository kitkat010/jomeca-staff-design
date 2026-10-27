import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { NotificationMonitor, StaffSession } from '@jomeca/shared';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Preview = {
  id: string;
  state: string;
  generation: number;
  envelope: { from: string; to: string[]; subject: string; text: string };
};
const stamp = (s: string | null) =>
  s
    ? new Date(s).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
    : 'Not recorded';
export function NotificationsPage() {
  const [session, setSession] = useState<StaffSession | null>(null),
    [loading, setLoading] = useState(true),
    [monitor, setMonitor] = useState<NotificationMonitor | null>(null),
    [filter, setFilter] = useState(''),
    [preview, setPreview] = useState<Preview | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    api<StaffSession>('/auth/session')
      .then((v) => {
        if (alive) setSession(v);
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
    if (!session?.user.permissions.includes('notifications.manage')) return;
    let alive = true;
    api<NotificationMonitor>('/admin/notifications')
      .then((v) => {
        if (alive) setMonitor(v);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [session]);
  async function load() {
    setBusy(true);
    setError('');
    try {
      setMonitor(
        await api<NotificationMonitor>(
          `/admin/notifications${filter ? `?state=${filter}` : ''}`,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load');
    } finally {
      setBusy(false);
    }
  }
  async function show(id: string) {
    setBusy(true);
    setError('');
    try {
      setPreview(await api<Preview>(`/admin/notifications/${id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to preview');
    } finally {
      setBusy(false);
    }
  }
  async function retry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview || !session) return;
    const f = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`/admin/notifications/${preview.id}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': session.csrfToken,
        },
        body: JSON.stringify({
          expectedGeneration: preview.generation,
          acknowledgeDuplicateRisk: f.get('risk') === 'on',
          reason: f.get('reason'),
        }),
      });
      setPreview(null);
      setMonitor(await api<NotificationMonitor>('/admin/notifications'));
      setNotice(
        'A new delivery attempt was authorized and audited. The configured email mode still applies.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to retry');
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <p role="status" className="wrap page-section">
        Checking staff access…
      </p>
    );
  if (!session)
    return (
      <section className="wrap page-section">
        <h1>Notification operations</h1>
        <p>Sign in to continue.</p>
        <Link to="/staff">Staff sign in</Link>
      </section>
    );
  if (!session.user.permissions.includes('notifications.manage'))
    return (
      <p className="wrap page-section">
        You do not have notification-management permission.
      </p>
    );
  return (
    <section className="wrap page-section operations">
      <div className="ops-heading">
        <div>
          <p className="section-label">Owner operations</p>
          <h1>Notifications & health</h1>
          <p>Monitor delivery, background tasks and backup coverage.</p>
        </div>
        <Link to="/staff">Staff workspace</Link>
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
      {monitor && (
        <>
          <div className="ops-calendar">
            <article className="ops-booking">
              <h2>Email mode: {monitor.mode}</h2>
              <p>
                {monitor.mode === 'sandbox'
                  ? 'Sandbox captures only. No external email is sent.'
                  : monitor.mode === 'disabled'
                    ? 'Sending is paused. Messages remain queued.'
                    : 'Live sender configured. Provider acceptance is separate from delivery.'}
              </p>
            </article>
            <article className="ops-booking">
              <h2>
                Worker: {monitor.worker.healthy ? 'Healthy' : 'Needs attention'}
              </h2>
              <p>
                Last successful cycle:{' '}
                {stamp(monitor.worker.heartbeat?.lastSucceededAt ?? null)}
              </p>
              <p>{monitor.worker.heartbeat?.errorCode}</p>
            </article>
            <article className="ops-booking">
              <h2>Backup: {monitor.backup.state}</h2>
              <p>
                Last successful archive: {stamp(monitor.backup.lastSucceededAt)}
              </p>
              <p>
                {monitor.backup.offsite
                  ? 'Offsite copy reported. Verify restore evidence separately.'
                  : 'An offsite copy has not been verified.'}
              </p>
            </article>
          </div>
          <p>
            {monitor.counts.map((c) => `${c.state}: ${c._count}`).join(' · ') ||
              'No notifications queued.'}
          </p>
          <p>
            {monitor.failedDeliveryCount} bounced/complaint/failed deliveries
            need review. Accepted messages are not necessarily delivered.
          </p>
        </>
      )}
      <form
        className="planning-form ops-filters"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <label className="ops-field">
          Queue state
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All states</option>
            {[
              'queued',
              'processing',
              'retry',
              'accepted',
              'sandboxed',
              'dead',
              'needs_review',
              'suppressed',
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <Button disabled={busy}>
          {busy ? 'Loading…' : 'Refresh queue and health'}
        </Button>
      </form>
      <p className="field-hint">
        Latest 50 messages. Delivery failures and suppressions are retained for
        review. Do not retry a message merely because a customer cannot find it;
        confirm the recipient and provider status first.
      </p>
      <div className="staff-card">
        <div className="staff-card-heading">
          <div>
            <h2>Message queue</h2>
            <p>
              Latest 50 messages · provider acceptance and delivery are separate
            </p>
          </div>
        </div>
        <div className="staff-table-scroll">
          <table className="staff-table">
            <thead>
              <tr>
                <th scope="col">Message</th>
                <th scope="col">Queue state</th>
                <th scope="col">Delivery</th>
                <th scope="col">Created · Manila</th>
                <th scope="col">Attempts</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {monitor?.jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <strong>{j.kind.replaceAll('_', ' ')}</strong>
                    <small>{j.audience}</small>
                    {j.errorCode && (
                      <small className="text-destructive">{j.errorCode}</small>
                    )}
                  </td>
                  <td>{j.state.replaceAll('_', ' ')}</td>
                  <td>{j.deliveryStatus ?? 'Not reported'}</td>
                  <td>{stamp(j.createdAt)}</td>
                  <td>{j.attempts}</td>
                  <td>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void show(j.id)}
                    >
                      Review message
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {monitor && monitor.jobs.length === 0 && (
          <div className="staff-empty">
            <strong>No messages in this view</strong>
            <p>Choose a different queue state or refresh the queue.</p>
          </div>
        )}
      </div>
      {preview && (
        <section className="planning-form">
          <h2>Private message preview</h2>
          <p>
            To: {preview.envelope.to.join(', ')} · From: {preview.envelope.from}
          </p>
          <h3>{preview.envelope.subject}</h3>
          <pre className="notification-preview">{preview.envelope.text}</pre>
          {['dead', 'needs_review'].includes(preview.state) && (
            <form className="ops-subform" onSubmit={retry}>
              <h3>Authorize another attempt</h3>
              <label className="consent-check">
                <input name="risk" type="checkbox" required />I checked provider
                status and understand that retrying an uncertain delivery may
                send a duplicate.
              </label>
              <label className="ops-field">
                Reason
                <textarea
                  name="reason"
                  minLength={5}
                  maxLength={1000}
                  required
                />
              </label>
              <Button disabled={busy}>Authorize retry</Button>
            </form>
          )}
          <Button variant="outline" onClick={() => setPreview(null)}>
            Close preview
          </Button>
        </section>
      )}
    </section>
  );
}
