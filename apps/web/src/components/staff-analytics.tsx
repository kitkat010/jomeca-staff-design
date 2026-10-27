// Chart composition adapted from Shadcn Space dashboard-shell-01 (MIT).
import { useId } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Wallet } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { summarizeReservations } from '@/lib/staff-dashboard';
import { money } from '@/lib/money';

type Summary = ReturnType<typeof summarizeReservations>;
const colors = [
  '#244e40',
  '#e9b949',
  '#66a5a0',
  '#d08d81',
  '#bac4be',
  '#a292b2',
];
const label = (date: string) =>
  new Date(`${date}T12:00:00+08:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  });
const statusLabel = (status: string) =>
  status === 'confirmed'
    ? 'Reserved'
    : status[0]!.toUpperCase() + status.slice(1);

function HoverInfo({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; color: string }[];
}) {
  return (
    <div className="analytics-tooltip" role="tooltip">
      <strong>{title}</strong>
      {rows.map((row) => (
        <div key={row.label}>
          <i style={{ background: row.color }} />
          <span>{row.label}</span>
          <b>{row.value}</b>
        </div>
      ))}
    </div>
  );
}

export function StaffAnalytics({
  summary,
  from,
  to,
  loading,
  canReport,
}: {
  summary: Summary | null;
  from: string;
  to: string;
  loading: boolean;
  canReport: boolean;
}) {
  const gradient = useId().replaceAll(':', '');
  const days = summary?.daily ?? [];
  const statuses =
    summary?.statuses
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        name: statusLabel(item.status),
        fill: colors[summary.statuses.indexOf(item)],
      })) ?? [];
  return (
    <div className="analytics-grid">
      <article className="staff-card analytics-activity">
        <div className="analytics-card-header">
          <div>
            <h2>Reservation activity</h2>
            <p>
              {label(from)} – {label(to)}
            </p>
          </div>
          <Link
            to={`/staff/operations?from=${from}&to=${to}`}
            className="analytics-icon-link"
            aria-label="Open reservations"
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="analytics-total">
          <strong>{summary?.total ?? '—'}</strong>
          <span>total bookings</span>
        </div>
        <div className="analytics-legend">
          <span>
            <i style={{ background: '#cedbd3' }} />
            All bookings
          </span>
          <span>
            <i style={{ background: '#244e40' }} />
            Reserved
          </span>
        </div>
        <div
          className="analytics-bar-chart"
          role="group"
          aria-label="Daily booking activity. Focus the chart and use arrow keys to inspect days."
        >
          {summary ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={days}
                accessibilityLayer
                margin={{ top: 16, right: 12, bottom: 4, left: -22 }}
                barGap={4}
              >
                <CartesianGrid vertical={false} stroke="#edf0ed" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={label}
                  tickMargin={14}
                  tick={{ fill: '#8a958e', fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a958e', fontSize: 11 }}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: '#f3f6f4', radius: 8 }}
                  content={({ active, payload, label: date }) =>
                    active && payload?.length ? (
                      <HoverInfo
                        title={label(String(date))}
                        rows={payload.map((item) => ({
                          label: String(item.name),
                          value: String(item.value ?? 0),
                          color: item.color ?? '#244e40',
                        }))}
                      />
                    ) : null
                  }
                />
                <Bar
                  dataKey="total"
                  name="All bookings"
                  fill="#cedbd3"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="confirmed"
                  name="Reserved"
                  fill="#244e40"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-placeholder">
              {loading ? 'Loading activity…' : 'Activity unavailable'}
            </div>
          )}
        </div>
        <div className="analytics-card-footer">
          <span>
            <i className="analytics-live-dot" />
            Live schedule
          </span>
          <Link to={`/staff/operations?from=${from}&to=${to}`}>
            View reservations <ArrowUpRight size={14} />
          </Link>
        </div>
        <table className="sr-only">
          <caption>
            Daily reservation activity and net verified receipts by session date
          </caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>All bookings</th>
              <th>Reserved</th>
              <th>Net verified receipts</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date}>
                <td>{label(day.date)}</td>
                <td>{day.total}</td>
                <td>{day.confirmed}</td>
                <td>{money(day.receivedCentavos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <div className="analytics-side">
        <article className="staff-card analytics-receipts">
          <div className="analytics-card-header">
            <h2>Verified receipts</h2>
            {canReport ? (
              <Link
                to={`/staff/reports?from=${from}&to=${to}`}
                className="analytics-icon-link"
                aria-label="View payment report"
              >
                <Wallet size={18} />
              </Link>
            ) : (
              <Wallet size={18} aria-hidden="true" />
            )}
          </div>
          <strong className="analytics-money">
            {summary ? money(summary.receivedCentavos) : '—'}
          </strong>
          <p className="analytics-caption">By session date</p>
          <div
            className="analytics-area-chart"
            role="group"
            aria-label="Net verified receipts by session date. Use arrow keys to inspect days."
          >
            {summary && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart
                  data={days}
                  accessibilityLayer
                  margin={{ top: 12, right: 3, left: 3, bottom: 3 }}
                >
                  <defs>
                    <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#244e40"
                        stopOpacity={0.22}
                      />
                      <stop offset="100%" stopColor="#244e40" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    cursor={{ stroke: '#bccdc1', strokeDasharray: '3 3' }}
                    content={({ active, payload, label: date }) =>
                      active && payload?.length ? (
                        <HoverInfo
                          title={label(String(date))}
                          rows={[
                            {
                              label: 'Net verified',
                              value: money(Number(payload[0]?.value ?? 0)),
                              color: '#244e40',
                            },
                          ]}
                        />
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="receivedCentavos"
                    name="Net verified"
                    stroke="#244e40"
                    strokeWidth={2}
                    fill={`url(#${gradient})`}
                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
        <article className="staff-card analytics-status">
          <div className="analytics-card-header">
            <h2>Booking status</h2>
          </div>
          <div className="analytics-status-body">
            <div className="analytics-status-legend">
              {statuses.map((item) => (
                <div key={item.status}>
                  <span>
                    <i style={{ background: item.fill }} />
                    {item.name}
                  </span>
                  <b>{item.count}</b>
                </div>
              ))}
              {!statuses.length && (
                <span className="analytics-caption">
                  {loading
                    ? 'Loading…'
                    : summary
                      ? 'No bookings'
                      : 'Unavailable'}
                </span>
              )}
            </div>
            <div
              className="analytics-donut"
              role="group"
              aria-label="Reservations by status"
            >
              {summary && summary.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart accessibilityLayer>
                    <Pie
                      data={statuses}
                      dataKey="count"
                      nameKey="name"
                      innerRadius="65%"
                      outerRadius="90%"
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {statuses.map((item) => (
                        <Cell key={item.status} fill={item.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <HoverInfo
                            title="Booking status"
                            rows={[
                              {
                                label: String(payload[0]?.name),
                                value: String(payload[0]?.value),
                                color: String(payload[0]?.payload.fill),
                              },
                            ]}
                          />
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="analytics-empty-ring" />
              )}
              <span className="analytics-donut-center">
                {summary?.total ?? '—'}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
