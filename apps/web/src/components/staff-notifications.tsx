import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Popover } from '@base-ui/react/popover';
import {
  Bell,
  CalendarDays,
  Inbox,
  CircleAlert,
  ArrowRight,
} from 'lucide-react';
import type {
  StaffSession,
  OperationRow,
  EventEnquiryData,
  NotificationMonitor,
} from '@jomeca/shared';
import { api } from '@/lib/api';
import { manilaDate, shiftDate } from '@/lib/planning';

type Update = {
  id: string;
  source: 'bookings' | 'events' | 'health';
  title: string;
  detail: string;
  to: string;
  time?: string;
};
const stamp = (value: string) =>
  new Date(value).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export function StaffNotifications({ session }: { session: StaffSession }) {
  const canRead = session.user.permissions.includes('booking.read');
  const canManage = session.user.permissions.includes('booking.manage');
  const canMonitor = session.user.permissions.includes('notifications.manage');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!canRead && !canManage && !canMonitor) return;
    let alive = true,
      running = false;
    const controller = new AbortController();
    const load = async () => {
      if (running) return;
      running = true;
      const from = manilaDate(),
        to = shiftDate(from, 6);
      const jobs: { source: Update['source']; request: Promise<Update[]> }[] =
        [];
      if (canRead)
        jobs.push({
          source: 'bookings',
          request: api<{ reservations: OperationRow[] }>(
            `/admin/reservations?from=${from}&to=${to}`,
            { signal: controller.signal },
          ).then((data) =>
            data.reservations
              .filter((row) => row.status === 'pending')
              .map((row) => ({
                id: row.reference,
                source: 'bookings',
                title: row.customerName ?? 'Pending reservation',
                detail: row.offering.name,
                to: `/staff/operations?reference=${encodeURIComponent(row.reference)}`,
                time: stamp(row.startsAt),
              })),
          ),
        });
      if (canManage)
        jobs.push({
          source: 'events',
          request: api<{ enquiries: EventEnquiryData[] }>(
            '/admin/event-enquiries',
            { signal: controller.signal },
          ).then((data) =>
            data.enquiries
              .filter((row) => row.status === 'new')
              .map((row) => ({
                id: row.reference,
                source: 'events',
                title: 'New event enquiry',
                detail: row.customerName,
                to: '/staff/operations?tab=Event+enquiries',
              })),
          ),
        });
      if (canMonitor)
        jobs.push({
          source: 'health',
          request: api<NotificationMonitor>('/admin/notifications', {
            signal: controller.signal,
          }).then((data) => {
            const items: Update[] = [];
            if (data.failedDeliveryCount > 0)
              items.push({
                id: 'delivery',
                source: 'health',
                title: 'Email delivery needs attention',
                detail: `${data.failedDeliveryCount} failed deliveries`,
                to: '/staff/notifications',
              });
            if (!data.worker.healthy)
              items.push({
                id: 'worker',
                source: 'health',
                title: 'Check service health',
                detail: 'Background worker needs attention',
                to: '/staff/notifications',
              });
            return items;
          }),
        });
      const results = await Promise.allSettled(jobs.map((job) => job.request));
      if (alive) {
        setUpdates((previous) =>
          jobs.flatMap((job, index) => {
            const result = results[index]!;
            return result.status === 'fulfilled'
              ? result.value
              : previous.filter((item) => item.source === job.source);
          }),
        );
        setError(results.some((result) => result.status === 'rejected'));
        setLoading(false);
      }
      running = false;
    };
    void load();
    const refresh = () => {
      if (!document.hidden) void load();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      alive = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [canRead, canManage, canMonitor]);
  if (!canRead && !canManage && !canMonitor) return null;
  return (
    <Popover.Root>
      <Popover.Trigger
        className="shell-icon-button staff-notification-trigger"
        aria-label={`Notifications${updates.length ? `, ${updates.length} updates` : ''}`}
      >
        <Bell size={19} aria-hidden="true" />
        {updates.length > 0 && (
          <span className="staff-notification-pulse" aria-hidden="true" />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={12}
          className="staff-notification-positioner"
        >
          <Popover.Popup className="staff-notification-popup">
            <div className="staff-notification-heading">
              <Popover.Title>Notifications</Popover.Title>
              {updates.length > 0 && <span>{updates.length} updates</span>}
            </div>
            <Popover.Description className="sr-only">
              Pending reservations for the next seven days, event enquiries and
              service alerts.
            </Popover.Description>
            {error && (
              <p className="staff-notification-error" role="status">
                Some updates could not refresh.
              </p>
            )}
            <div className="staff-notification-list">
              {updates.slice(0, 8).map((item) => {
                const Icon =
                  item.source === 'bookings'
                    ? CalendarDays
                    : item.source === 'events'
                      ? Inbox
                      : CircleAlert;
                return (
                  <Popover.Close
                    key={`${item.source}-${item.id}`}
                    nativeButton={false}
                    render={<Link to={item.to} />}
                    className="staff-notification-item"
                  >
                    <span className={`staff-notification-icon ${item.source}`}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="staff-notification-copy">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                      {item.time && <small>{item.time}</small>}
                    </span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Popover.Close>
                );
              })}
              {!updates.length && (
                <div className="staff-notification-empty">
                  <Bell size={25} aria-hidden="true" />
                  <strong>
                    {loading
                      ? 'Loading updates…'
                      : error
                        ? 'Updates unavailable'
                        : 'You’re all caught up'}
                  </strong>
                </div>
              )}
            </div>
            <div className="staff-notification-footer">
              <Popover.Close
                nativeButton={false}
                render={
                  <Link
                    to={
                      canRead
                        ? '/staff/operations'
                        : canMonitor
                          ? '/staff/notifications'
                          : '/staff/operations?tab=Event+enquiries'
                    }
                  />
                }
              >
                {canRead ? 'View reservations' : 'View all updates'}
                <ArrowRight size={15} aria-hidden="true" />
              </Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
