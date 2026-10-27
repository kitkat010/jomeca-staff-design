import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, Plus, X, SlidersHorizontal, Save } from 'lucide-react';
import type { BookingConfiguration, StaffSession } from '@jomeca/shared';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { centavosFromInput, pesoInput } from '@/lib/money';
import { WeeklyHoursRow } from '@/components/weekly-hours-row';
import { courtRateOptions } from '@/lib/court-rate-form';
import { CourtRateCard } from '@/components/court-rate-card';

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const clockText = (minute: number | null | undefined) =>
  minute === null || minute === undefined
    ? ''
    : `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const minutes = (value: string) => {
  if (!/^\d{2}:\d{2}$/.test(value))
    throw new Error('Enter valid opening and closing times.');
  const [h, m] = value.split(':').map(Number);
  return h! * 60 + m!;
};
const text = (data: FormData, name: string) =>
  String(data.get(name) ?? '').trim();
const num = (data: FormData, name: string) => Number(text(data, name));
const nullableNum = (data: FormData, name: string) =>
  text(data, name) === '' ? null : num(data, name);
const checked = (data: FormData, name: string) => data.get(name) === 'on';
function Field({
  label,
  name,
  type = 'text',
  value = '',
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string | number | null;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ''}
        required={required}
        min={min}
        max={max}
        step={step}
      />
    </label>
  );
}
function Check({
  label,
  name,
  value = false,
}: {
  label: string;
  name: string;
  value?: boolean;
}) {
  return (
    <label className="admin-check">
      <input type="checkbox" name={name} defaultChecked={value} />
      {label}
    </label>
  );
}
function Panel({
  title,
  children,
  onSave,
  busy,
  submitLabel = 'Save changes',
  onCancel,
  feedback,
}: {
  title: string;
  children: ReactNode;
  onSave: (data: FormData) => Promise<void>;
  busy: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  feedback?: { error: string; message: string };
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSave(new FormData(event.currentTarget));
  }
  const opener = useRef<HTMLElement | null>(
    document.activeElement as HTMLElement,
  );
  const form = (
    <form className="admin-panel" onSubmit={submit}>
      <div className="settings-panel-heading">
        {onCancel ? (
          <div className="settings-editor-title">
            <span className="settings-editor-symbol">
              <SlidersHorizontal size={21} aria-hidden="true" />
            </span>
            <Dialog.Title asChild>
              <h2>{title}</h2>
            </Dialog.Title>
          </div>
        ) : (
          <h2>{title}</h2>
        )}
        {onCancel && (
          <Dialog.Close
            className="settings-editor-close"
            disabled={busy}
            aria-label="Close editor"
          >
            <X size={17} />
          </Dialog.Close>
        )}
      </div>
      {feedback?.error && (
        <p role="alert" className="admin-alert">
          {feedback.error}
        </p>
      )}
      {feedback?.message && <p role="status">{feedback.message}</p>}
      <fieldset disabled={busy}>
        {onCancel ? (
          <>
            <div className="settings-editor-fields">{children}</div>
            <div className="settings-editor-footer">
              <Field label="Reason for change" name="reason" required />
              <div className="settings-editor-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  <Save size={15} aria-hidden="true" />
                  {busy ? 'Saving…' : submitLabel}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {children}
            <Field label="Reason for change" name="reason" required />
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : submitLabel}
            </Button>
          </>
        )}
      </fieldset>
    </form>
  );
  if (!onCancel) return form;
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay settings-editor-overlay" />
        <Dialog.Content
          className="dialog-content staff-main settings-editor-dialog"
          aria-describedby={undefined}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
        >
          {form}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CourtMaintenancePage() {
  return <BookingSettingsPage maintenanceOnly />;
}

export function BookingSettingsPage({
  maintenanceOnly = false,
}: {
  maintenanceOnly?: boolean;
}) {
  const [session, setSession] = useState<StaffSession | null>(null),
    [config, setConfig] = useState<BookingConfiguration | null>(null),
    [tab, setTab] = useState(maintenanceOnly ? 'Resource blocks' : 'Readiness'),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const [rateId, setRateId] = useState(''),
    [equipmentId, setEquipmentId] = useState(''),
    [promoId, setPromoId] = useState('');
  const [editingRate, setEditingRate] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(false);
  const [editingPromo, setEditingPromo] = useState(false);
  const [audit, setAudit] = useState<
    {
      id: string;
      action: string;
      reason: string | null;
      createdAt: string;
      actor: { name: string } | null;
      details: unknown;
    }[]
  >([]);
  useEffect(() => {
    let alive = true;
    api<StaffSession>('/auth/session')
      .then(async (value) => {
        if (!alive) return;
        setSession(value);
        if (value.user.permissions.includes('settings.write')) {
          const result = await api<BookingConfiguration>(
            '/admin/booking/config',
          );
          if (alive) setConfig(result);
        } else
          setError('Your staff role does not permit booking configuration.');
      })
      .catch((err) => {
        if (alive)
          setError(
            err instanceof Error ? err.message : 'Unable to load settings',
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  async function save(
    path: string,
    payload: Record<string, unknown>,
    method = 'POST',
  ) {
    if (!session || !config) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(`/admin/booking/${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': session.csrfToken,
        },
        body: JSON.stringify({
          ...payload,
          revision: config.settings.revision,
        }),
      });
      setConfig(await api<BookingConfiguration>('/admin/booking/config'));
      setMessage('Changes saved.');
      setEditingRate(false);
      setEditingEquipment(false);
      setEditingPromo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setBusy(false);
    }
  }
  async function attempt(work: () => Promise<void>) {
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check the entered values');
    }
  }
  async function reload() {
    try {
      setConfig(await api<BookingConfiguration>('/admin/booking/config'));
      setError('');
      setMessage('Settings refreshed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reload');
    }
  }
  if (!config)
    return (
      <section className="wrap page-heading">
        <h1>Booking configuration</h1>
        <p className="lead" role={error ? 'alert' : 'status'}>
          {error || 'Loading your authorized settings…'}
        </p>
        <Link className="text-link" to="/staff">
          Staff sign in
        </Link>
      </section>
    );
  const { settings } = config;
  const rate = config.rates.find((row) => row.id === rateId),
    equipment = config.equipment.find((row) => row.id === equipmentId),
    promo = config.promos.find((row) => row.id === promoId);
  const reason = (data: FormData) => ({ reason: text(data, 'reason') });
  const idPayload = (id: string) => (id ? { id } : {});
  function settingTab(key: string, label: string) {
    return (
      <button
        key={key}
        aria-pressed={tab === key}
        onClick={(event) => {
          setTab(key);
          setMessage('');
          const menu = event.currentTarget.closest('details');
          menu?.removeAttribute('open');
          menu?.querySelector('summary')?.focus();
          if (key === 'Audit history')
            void api<{ events: typeof audit }>('/admin/booking/audit')
              .then((value) => setAudit(value.events))
              .catch((err) => setError(err.message));
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <section className="wrap admin-workspace">
      <div className="admin-heading">
        <div>
          <Link className="breadcrumb" to="/staff">
            Staff workspace
          </Link>
          <h1>
            {maintenanceOnly ? 'Facility maintenance' : 'Booking settings'}
          </h1>
          <p>
            {maintenanceOnly
              ? 'Close courts for maintenance and reopen them when ready.'
              : 'Manage online bookings, court hours and rates.'}
          </p>
        </div>
        <Button variant="outline" onClick={() => void reload()} disabled={busy}>
          Refresh
        </Button>
      </div>
      {error && (
        <p className="admin-alert" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-success" role="status">
          {message}
        </p>
      )}
      <div
        className={`admin-grid ${maintenanceOnly ? 'maintenance-workspace' : ''}`}
      >
        {!maintenanceOnly && (
          <div className="booking-settings-nav">
            <nav
              className="admin-tabs"
              aria-label="Booking configuration sections"
            >
              {(
                [
                  ['Readiness', 'General'],
                  ['Opening hours', 'Hours'],
                  ['Price rules', 'Court rates'],
                ] as const
              ).map(([key, label]) => settingTab(key, label))}
            </nav>
          </div>
        )}
        <div className="admin-body" key={`${settings.revision}-${tab}`}>
          {tab === 'Readiness' && (
            <>
              <div className="booking-settings-summary">
                <div>
                  <span>Online requests</span>
                  <strong
                    className={
                      settings.requestsEnabled ? 'settings-is-open' : ''
                    }
                  >
                    {settings.requestsEnabled ? 'Open' : 'Paused'}
                  </strong>
                </div>
                <div>
                  <span>Payment hold</span>
                  <strong>
                    {settings.holdMinutes === null
                      ? 'Not set'
                      : `${settings.holdMinutes} min`}
                  </strong>
                </div>
                <div>
                  <span>Active rates</span>
                  <strong>
                    {config.rates.filter((rate) => rate.active).length}
                  </strong>
                </div>
                <div>
                  <span>Terms & privacy</span>
                  <strong>
                    {config.policies.some(
                      (policy) =>
                        policy.id === settings.policyId && policy.published,
                    )
                      ? 'Selected'
                      : 'Required'}
                  </strong>
                </div>
              </div>
              <Panel
                title="Online bookings"
                busy={busy}
                onSave={(data) =>
                  save(
                    'settings',
                    {
                      ...reason(data),
                      requestsEnabled: checked(data, 'enabled'),
                      holdMinutes: nullableNum(data, 'hold'),
                      eventEnquiryFirst: checked(data, 'eventFirst'),
                      policyId: text(data, 'policy') || null,
                    },
                    'PUT',
                  )
                }
              >
                <Check
                  label="Accept online reservation requests"
                  name="enabled"
                  value={settings.requestsEnabled}
                />
                <div className="admin-fields">
                  <Field
                    label="Payment hold (minutes)"
                    name="hold"
                    type="number"
                    min={5}
                    max={1440}
                    value={settings.holdMinutes}
                  />

                  <label className="admin-field">
                    <span>Published terms & privacy</span>
                    <select
                      name="policy"
                      defaultValue={settings.policyId ?? ''}
                    >
                      <option value="">Not selected</option>
                      {config.policies
                        .filter((p) => p.published)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.version}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <details className="settings-more">
                  <summary>
                    Event requests <ChevronDown size={14} aria-hidden="true" />
                  </summary>
                  <Check
                    label="Collect event enquiries before issuing a booking"
                    name="eventFirst"
                    value={settings.eventEnquiryFirst !== false}
                  />
                </details>
                <p className="field-hint">
                  Requests still require complete rates, hours and payment
                  setup.
                </p>
              </Panel>
            </>
          )}
          {tab === 'Booking rules' &&
            config.rules.map((rule) => (
              <Panel
                key={rule.kind}
                title={`${rule.kind === 'sports' ? 'Sports' : 'Private event'} rules`}
                busy={busy}
                onSave={(data) =>
                  save(
                    `rules/${rule.kind}`,
                    {
                      ...reason(data),
                      minMinutes: num(data, 'min'),
                      maxMinutes: num(data, 'max'),
                      stepMinutes: num(data, 'step'),
                      cutoffMinutes: num(data, 'cutoff'),
                      advanceDays: nullableNum(data, 'days'),
                      advanceMonths: nullableNum(data, 'months'),
                      setupMinutes: nullableNum(data, 'setup'),
                      teardownMinutes: nullableNum(data, 'teardown'),
                      buffersOutsideHours: checked(data, 'outside'),
                    },
                    'PUT',
                  )
                }
              >
                <div className="admin-fields">
                  <Field
                    label="Minimum session (minutes)"
                    name="min"
                    type="number"
                    value={rule.minMinutes}
                    required
                  />
                  <Field
                    label="Maximum session (minutes)"
                    name="max"
                    type="number"
                    value={rule.maxMinutes}
                    required
                  />
                  <Field
                    label="Slot increment (minutes)"
                    name="step"
                    type="number"
                    value={rule.stepMinutes}
                    required
                  />
                  <Field
                    label="Booking cutoff (minutes before start)"
                    name="cutoff"
                    type="number"
                    value={rule.cutoffMinutes}
                    required
                  />
                  <Field
                    label="Advance window in days (choose one unit)"
                    name="days"
                    type="number"
                    value={rule.advanceDays}
                  />
                  <Field
                    label="Advance window in calendar months"
                    name="months"
                    type="number"
                    value={rule.advanceMonths}
                  />
                  <Field
                    label="Setup time (minutes; blank = not configured)"
                    name="setup"
                    type="number"
                    min={0}
                    value={rule.setupMinutes}
                  />
                  <Field
                    label="Teardown time (minutes; blank = not configured)"
                    name="teardown"
                    type="number"
                    min={0}
                    value={rule.teardownMinutes}
                  />
                </div>
                <Check
                  label="Permit buffers outside operating hours (activity must still fit)"
                  name="outside"
                  value={rule.buffersOutsideHours}
                />
                <p className="field-hint">
                  Calendar windows include the final local date; calendar-month
                  windows clamp to the last valid day. Sports and events always
                  share physical resource constraints.
                </p>
              </Panel>
            ))}
          {tab === 'Opening hours' && (
            <>
              <Panel
                title="Weekly schedule"
                submitLabel="Save weekly hours"
                busy={busy}
                onSave={(data) =>
                  save(
                    'hours',
                    {
                      ...reason(data),
                      days: config.hours.map((day) => ({
                        weekday: day.weekday,
                        closed: checked(data, `closed${day.weekday}`),
                        opensMinute: minutes(text(data, `open${day.weekday}`)),
                        closesMinute:
                          minutes(text(data, `close${day.weekday}`)) +
                          (checked(data, `next${day.weekday}`) ? 1440 : 0),
                      })),
                    },
                    'PUT',
                  )
                }
              >
                <div className="weekly-hours-context">
                  <span>Philippine time</span>
                  <span>Use +1 day for overnight hours.</span>
                </div>
                <div className="weekly-hours-grid">
                  <div className="weekly-hours-heading" aria-hidden="true">
                    <span>Day</span>
                    <div>
                      <span>Opening time</span>
                      <span />
                      <span>Closing time</span>
                      <span>Day ends</span>
                    </div>
                  </div>
                  {config.hours.map((day) => (
                    <WeeklyHoursRow
                      key={day.weekday}
                      day={day}
                      label={days[day.weekday]!}
                    />
                  ))}
                </div>
              </Panel>
              <details className="settings-more settings-special-hours">
                <summary>
                  Special dates & holidays{' '}
                  <span>{config.exceptions.length}</span>
                  <ChevronDown size={14} aria-hidden="true" />
                </summary>
                <Panel
                  title="Holiday or special-date hours"
                  busy={busy}
                  onSave={(data) =>
                    attempt(() =>
                      save(
                        'exception',
                        {
                          ...reason(data),
                          date: text(data, 'date'),
                          closed: checked(data, 'closed'),
                          opensMinute: checked(data, 'closed')
                            ? null
                            : minutes(text(data, 'opens')),
                          closesMinute: checked(data, 'closed')
                            ? null
                            : minutes(text(data, 'closes')) +
                              (checked(data, 'next') ? 1440 : 0),
                        },
                        'PUT',
                      ),
                    )
                  }
                >
                  <Field label="Date" name="date" type="date" required />
                  <Check
                    label="Closed for this calendar date"
                    name="closed"
                    value
                  />
                  <div className="admin-fields">
                    <Field
                      label="Alternate opening time (if open)"
                      name="opens"
                      type="time"
                    />
                    <Field
                      label="Alternate closing time (if open)"
                      name="closes"
                      type="time"
                    />
                  </div>
                  <Check label="Closes next day" name="next" />
                  {config.exceptions.map((item) => (
                    <p className="field-hint" key={item.date}>
                      {item.date}:{' '}
                      {item.closed
                        ? 'Closed'
                        : `${clockText(item.opensMinute)}–${clockText(item.closesMinute)}`}{' '}
                      · {item.reason}
                    </p>
                  ))}
                </Panel>
              </details>
            </>
          )}
          {tab === 'Price rules' && (
            <>
              <div className="settings-rates-heading">
                <h2>Court rates</h2>
                <Button
                  onClick={() => {
                    setRateId('');
                    setError('');
                    setMessage('');
                    setEditingRate(true);
                  }}
                >
                  <Plus size={15} />
                  Add rate
                </Button>
              </div>
              <div className="settings-rate-list settings-rate-grid">
                {config.rates.map((item) => (
                  <CourtRateCard
                    key={item.id}
                    rate={item}
                    offering={config.offerings.find(
                      (offering) => offering.id === item.offeringId,
                    )}
                    onEdit={() => {
                      setRateId(item.id);
                      setError('');
                      setMessage('');
                      setEditingRate(true);
                    }}
                  />
                ))}
                {!config.rates.length && (
                  <p className="field-hint">No court rates configured.</p>
                )}
              </div>
              {editingRate && (
                <div key={rateId}>
                  <Panel
                    title={rate ? 'Edit court rate' : 'New court rate'}
                    onCancel={() => setEditingRate(false)}
                    feedback={{ error, message }}
                    busy={busy}
                    onSave={(data) =>
                      attempt(() =>
                        save('rates', {
                          ...reason(data),
                          ...idPayload(rateId),
                          offeringId: text(data, 'offering'),
                          name: text(data, 'name'),
                          hourlyCentavos: centavosFromInput(
                            text(data, 'price'),
                          ),
                          weekday:
                            text(data, 'weekday') === ''
                              ? null
                              : num(data, 'weekday'),
                          startMinute: minutes(text(data, 'start')),
                          ...courtRateOptions(
                            rate,
                            data,
                            minutes(text(data, 'end')),
                          ),
                        }),
                      )
                    }
                  >
                    <div className="admin-fields">
                      <label className="admin-field">
                        <span>Court / offering</span>
                        <select
                          name="offering"
                          defaultValue={
                            rate?.offeringId ?? config.offerings[0]?.id
                          }
                          required
                        >
                          {config.offerings.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Field
                        label="Rate name"
                        name="name"
                        value={rate?.name}
                        required
                      />
                      <Field
                        label="Hourly price (PHP)"
                        name="price"
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={pesoInput(rate?.hourlyCentavos)}
                        required
                      />

                      <label className="admin-field">
                        <span>Day</span>
                        <select
                          name="weekday"
                          defaultValue={rate?.weekday ?? ''}
                        >
                          <option value="">Every day</option>
                          {days.map((day, n) => (
                            <option key={day} value={n}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </label>

                      <Field
                        label="Time range starts"
                        name="start"
                        type="time"
                        value={clockText(rate?.startMinute)}
                        required
                      />
                      <Field
                        label="Time range ends"
                        name="end"
                        type="time"
                        value={clockText(rate?.endMinute)}
                        required
                      />
                      {!rate && (
                        <>
                          <Field
                            label="Effective from (inclusive)"
                            name="from"
                            type="date"
                            required
                          />
                          <Field
                            label="Effective until (inclusive; optional)"
                            name="until"
                            type="date"
                          />
                        </>
                      )}
                    </div>
                    {!rate && (
                      <>
                        <details className="settings-more">
                          <summary>
                            Advanced pricing{' '}
                            <ChevronDown size={14} aria-hidden="true" />
                          </summary>
                          <div className="admin-fields">
                            <label className="admin-field">
                              <span>Customer tier</span>
                              <select name="tier" defaultValue="standard">
                                <option value="standard">
                                  Standard / non-member
                                </option>
                                <option value="member">
                                  Verified member (public redemption not enabled
                                  yet)
                                </option>
                              </select>
                            </label>
                            <Field
                              label="Priority (higher overrides lower)"
                              name="priority"
                              type="number"
                              min={0}
                              max={1000}
                              value={0}
                              required
                            />
                          </div>
                        </details>
                        <Check
                          label="Time range ends at 12 midnight"
                          name="midnight"
                        />
                        <Check label="Rate enabled" name="active" value />
                        <p className="field-hint">
                          Use a higher-priority rule for peak periods.
                          Equal-priority overlapping rules are rejected.
                          Existing reservation prices never change. Public
                          quotes always use standard pricing until membership
                          verification is implemented.
                        </p>
                      </>
                    )}
                  </Panel>
                </div>
              )}
            </>
          )}
          {tab === 'Equipment' && (
            <>
              <label className="admin-field">
                <span>Choose equipment</span>
                <select
                  value={equipmentId}
                  onChange={(event) => {
                    setEquipmentId(event.target.value);
                    setError('');
                    setMessage('');
                    setEditingEquipment(true);
                  }}
                >
                  <option value="">Create a rental item</option>
                  {config.equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                onClick={() => {
                  setError('');
                  setMessage('');
                  setEditingEquipment(true);
                }}
              >
                {equipmentId ? 'Edit rental' : 'Add rental'}
              </Button>
              {editingEquipment && (
                <div key={equipmentId}>
                  <Panel
                    onCancel={() => setEditingEquipment(false)}
                    feedback={{ error, message }}
                    title={
                      equipment
                        ? 'Edit rental configuration'
                        : 'New rental configuration'
                    }
                    busy={busy}
                    onSave={(data) =>
                      attempt(() =>
                        save('equipment', {
                          ...reason(data),
                          ...idPayload(equipmentId),
                          name: text(data, 'name'),
                          totalStock: nullableNum(data, 'stock'),
                          hourlyCentavos:
                            text(data, 'price') === ''
                              ? null
                              : centavosFromInput(text(data, 'price')),
                          available: checked(data, 'available'),
                        }),
                      )
                    }
                  >
                    <Field
                      label="Equipment name"
                      name="name"
                      value={equipment?.name}
                      required
                    />
                    <div className="admin-fields">
                      <Field
                        label="Serviceable stock (blank = unconfigured)"
                        name="stock"
                        type="number"
                        min={0}
                        value={equipment?.totalStock}
                      />
                      <Field
                        label="Hourly rental price (PHP; blank = unconfigured)"
                        name="price"
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={pesoInput(equipment?.hourlyCentavos)}
                      />
                    </div>
                    <Check
                      label="Available for rental (requires a price and stock)"
                      name="available"
                      value={equipment?.available}
                    />
                    <p className="field-hint">
                      Only fully configured available items appear publicly.
                      Simultaneous reservations cannot exceed stock, and stock
                      cannot be lowered below existing allocations.
                    </p>
                  </Panel>
                </div>
              )}
            </>
          )}
          {tab === 'Promotions' && (
            <>
              <label className="admin-field">
                <span>Promotion</span>
                <select
                  value={promoId}
                  onChange={(event) => {
                    setPromoId(event.target.value);
                    setError('');
                    setMessage('');
                    setEditingPromo(true);
                  }}
                >
                  <option value="">Create a promo code</option>
                  {config.promos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                onClick={() => {
                  setError('');
                  setMessage('');
                  setEditingPromo(true);
                }}
              >
                {promoId ? 'Edit promotion' : 'Add promotion'}
              </Button>
              {editingPromo && (
                <div key={promoId}>
                  <Panel
                    onCancel={() => setEditingPromo(false)}
                    feedback={{ error, message }}
                    title="Promo code configuration"
                    busy={busy}
                    onSave={(data) =>
                      attempt(() =>
                        save('promos', {
                          ...reason(data),
                          ...idPayload(promoId),
                          code: text(data, 'code').toUpperCase(),
                          percentOff: nullableNum(data, 'percent'),
                          flatCentavos:
                            text(data, 'flat') === ''
                              ? null
                              : centavosFromInput(text(data, 'flat')),
                          usageLimit: nullableNum(data, 'limit'),
                          effectiveFrom: text(data, 'from'),
                          effectiveUntil: text(data, 'until') || null,
                          active: checked(data, 'active'),
                        }),
                      )
                    }
                  >
                    <Field
                      label="Promo code"
                      name="code"
                      value={promo?.code}
                      required
                    />
                    <div className="admin-fields">
                      <Field
                        label="Percent off (choose one discount type)"
                        name="percent"
                        type="number"
                        min={1}
                        max={100}
                        value={promo?.percentOff}
                      />
                      <Field
                        label="Fixed discount (PHP)"
                        name="flat"
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={pesoInput(promo?.flatCentavos)}
                      />
                      <Field
                        label="Usage limit (blank = no limit)"
                        name="limit"
                        type="number"
                        min={1}
                        value={promo?.usageLimit}
                      />
                      <Field
                        label="Effective from"
                        name="from"
                        type="date"
                        value={promo?.effectiveFrom}
                        required
                      />
                      <Field
                        label="Effective until (optional)"
                        name="until"
                        type="date"
                        value={promo?.effectiveUntil}
                      />
                    </div>
                    <Check
                      label="Active"
                      name="active"
                      value={promo?.active ?? true}
                    />
                    <p className="field-hint">
                      One code per booking; no stacking. Discounts apply to the
                      court and selected rentals. Active pending holds reserve a
                      redemption; expired holds release it.
                    </p>
                  </Panel>
                </div>
              )}
            </>
          )}
          {tab === 'Policies' && (
            <>
              <div className="admin-explainer">
                <p>
                  No draft text is supplied as approved legal policy. Create a
                  new version from management-approved terms and privacy
                  wording. Versions cannot be edited after creation; old
                  bookings retain their accepted version.
                </p>
              </div>
              <Panel
                title="New terms & privacy version"
                busy={busy}
                onSave={(data) =>
                  save('policies', {
                    ...reason(data),
                    version: text(data, 'version'),
                    terms: text(data, 'terms'),
                    privacy: text(data, 'privacy'),
                    published: checked(data, 'published'),
                  })
                }
              >
                <Field label="Version label" name="version" required />
                <label className="admin-field">
                  <span>Approved booking terms / waiver</span>
                  <textarea
                    name="terms"
                    minLength={20}
                    maxLength={6000}
                    rows={8}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Approved privacy notice</span>
                  <textarea
                    name="privacy"
                    minLength={20}
                    maxLength={6000}
                    rows={8}
                    required
                  />
                </label>
                <Check
                  label="Management approved both texts for publication"
                  name="published"
                />
                {config.policies.map((p) => (
                  <details className="policy-draft" key={p.id}>
                    <summary>
                      {p.version} · {p.published ? 'Published' : 'Draft'}
                    </summary>
                    <p className="policy-copy">{p.terms}</p>
                    <p className="policy-copy">{p.privacy}</p>
                  </details>
                ))}
              </Panel>
            </>
          )}
          {tab === 'Resource blocks' && (
            <>
              <Panel
                title="Schedule a court closure"
                submitLabel="Close selected courts"
                busy={busy}
                onSave={(data) =>
                  attempt(() => {
                    const resourceIds = data.getAll('resources').map(String);
                    if (!resourceIds.length)
                      throw new Error('Select at least one court to close.');
                    if (text(data, 'end') <= text(data, 'start'))
                      throw new Error(
                        'The reopening time must be after the closure starts.',
                      );
                    return save('blocks', {
                      ...reason(data),
                      resourceIds,
                      startsAt: new Date(
                        `${text(data, 'start')}:00+08:00`,
                      ).toISOString(),
                      endsAt: new Date(
                        `${text(data, 'end')}:00+08:00`,
                      ).toISOString(),
                    });
                  })
                }
              >
                <p className="field-hint">
                  Closed courts cannot be booked during this period. Existing
                  reservations and active holds must be resolved first. The
                  gymnasium also closes every use of the gymnasium.
                </p>
                <div className="maintenance-court-options">
                  {config.resources
                    .filter((r) => r.active)
                    .map((r) => (
                      <label className="maintenance-court-option" key={r.id}>
                        <input type="checkbox" name="resources" value={r.id} />
                        <span>{r.name}</span>
                      </label>
                    ))}
                </div>
                <div className="admin-fields">
                  <Field
                    label="Closed from · Philippine time"
                    name="start"
                    type="datetime-local"
                    required
                  />
                  <Field
                    label="Reopens at · Philippine time"
                    name="end"
                    type="datetime-local"
                    required
                  />
                </div>
              </Panel>
              <h2 className="maintenance-list-heading">Scheduled closures</h2>
              {!config.blocks.some((block) =>
                block.allocations.some(
                  (a) => a.active && new Date(a.endsAt) > new Date(),
                ),
              ) && (
                <p className="maintenance-empty">No upcoming court closures.</p>
              )}
              {config.blocks
                .filter((block) =>
                  block.allocations.some(
                    (a) => a.active && new Date(a.endsAt) > new Date(),
                  ),
                )
                .map((block) => (
                  <Panel
                    key={block.id}
                    title={block.reason}
                    submitLabel="Reopen court"
                    busy={busy}
                    onSave={(data) =>
                      save(`blocks/${block.id}/release`, reason(data), 'PUT')
                    }
                  >
                    <ul className="block-list">
                      {block.allocations
                        .filter((a) => a.active)
                        .map((allocation) => (
                          <li key={allocation.id}>
                            {allocation.resource.name}
                            <br />
                            {new Date(allocation.startsAt).toLocaleString(
                              'en-PH',
                              {
                                timeZone: 'Asia/Manila',
                              },
                            )}
                            –
                            {new Date(allocation.endsAt).toLocaleString(
                              'en-PH',
                              {
                                timeZone: 'Asia/Manila',
                              },
                            )}
                          </li>
                        ))}
                    </ul>
                    <p className="field-hint">
                      Reopening removes this closure. The original reason and
                      change history are retained.
                    </p>
                  </Panel>
                ))}
            </>
          )}
          {tab === 'Audit history' && (
            <div className="admin-panel">
              <h2>Configuration audit history</h2>
              <p className="field-hint">
                Latest 100 changes. Historical values are retained; nothing here
                changes a booking.
              </p>
              {!audit.length && <p>No configuration changes recorded yet.</p>}
              {audit.map((event) => (
                <details className="policy-draft" key={event.id}>
                  <summary>
                    {new Date(event.createdAt).toLocaleString('en-PH', {
                      timeZone: 'Asia/Manila',
                    })}{' '}
                    · {event.action}
                  </summary>
                  <p>
                    {event.actor?.name ?? 'System'} · {event.reason}
                  </p>
                  <pre className="audit-json">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
