import { z } from 'zod';

export const venueTimeZone = 'Asia/Manila';
export const permissionCodes = [
  'staff.read',
  'booking.read',
  'booking.check_in',
  'booking.manage',
  'payment.review',
  'reports.read',
  'notifications.manage',
  'settings.write',
] as const;
export type PermissionCode = (typeof permissionCodes)[number];

export const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

export interface StaffSession {
  user: {
    id: string;
    name: string;
    email: string;
    permissions: PermissionCode[];
  };
  csrfToken: string;
  expiresAt: string;
}

export interface BookingRuleData {
  kind: string;
  minMinutes: number;
  maxMinutes: number;
  stepMinutes: number;
  cutoffMinutes: number;
  advanceDays: number | null;
  advanceMonths: number | null;
  setupMinutes: number | null;
  teardownMinutes: number | null;
  buffersOutsideHours: boolean;
}
export interface PolicyData {
  id: string;
  version: string;
  terms: string;
  privacy: string;
  published?: boolean;
}
export interface OfferingData {
  id: string;
  code: string;
  name: string;
  kind: string;
  resources?: { id: string; code: string; name: string }[];
}
export interface EquipmentData {
  id: string;
  name: string;
  hourlyCentavos: number | null;
  totalStock?: number | null;
  available?: boolean;
}
export interface BookingCatalog {
  paymentMethods?: ('qr' | 'cash')[];
  timezone: string;
  requestsEnabled: boolean;
  holdMinutes: number | null;
  eventEnquiryFirst: boolean;
  policy: PolicyData | null;
  offerings: OfferingData[];
  rules: BookingRuleData[];
  equipment: EquipmentData[];
}
export interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
  available: boolean;
  canRequest: boolean;
  totalCentavos: number | null;
  reason: string | null;
}
export interface AvailabilityResult {
  date: string;
  offeringCode: string;
  issues: string[];
  slots: AvailabilitySlot[];
}
export interface VenueCalendar {
  month: string;
  checkedAt: string;
  setupMinutes: number | null;
  teardownMinutes: number | null;
  days: {
    date: string;
    busy: { start: number; end: number }[];
    conflicts: { start: number; end: number }[];
    hours: { start: number; end: number }[];
  }[];
}
export interface QuoteData {
  id: string;
  token: string;
  expiresAt: string;
  startsAt: string;
  endsAt: string;
  totalCentavos: number;
  subtotalCentavos: number;
  discountCentavos: number;
  currency: string;
  holdMinutes: number;
  policy: PolicyData;
  lines: {
    label: string;
    quantityMinutes: number;
    hourlyCentavos: number;
    amountCentavos: number;
  }[];
}
export interface ReservationReceipt {
  paymentMethod?: 'qr' | 'cash';
  reference: string;
  status: string;
  paymentStatus: string;
  holdUntil: string | null;
  startsAt: string;
  endsAt: string;
  totalCentavos: number;
  discountCentavos: number;
  currency: string;
  message: string;
  requiredCentavos?: number | null;
  paidCentavos?: number;
  balanceCentavos?: number | null;
}
export interface OpeningHourData {
  weekday: number;
  opensMinute: number;
  closesMinute: number;
  closed: boolean;
}
export interface RateData {
  id: string;
  offeringId: string;
  name: string;
  hourlyCentavos: number;
  tier: string;
  weekday: number | null;
  startMinute: number;
  endMinute: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
  priority: number;
  active: boolean;
}
export interface PromoData {
  id: string;
  code: string;
  percentOff: number | null;
  flatCentavos: number | null;
  usageLimit: number | null;
  effectiveFrom: string;
  effectiveUntil: string | null;
  active: boolean;
}
export interface BookingConfiguration {
  blocks: {
    id: string;
    reason: string;
    allocations: {
      id: string;
      startsAt: string;
      endsAt: string;
      active: boolean;
      resource: { name: string };
    }[];
  }[];
  settings: {
    id: string;
    revision: number;
    requestsEnabled: boolean;
    holdMinutes: number | null;
    eventEnquiryFirst: boolean | null;
    policyId: string | null;
  };
  rules: BookingRuleData[];
  hours: OpeningHourData[];
  offerings: OfferingData[];
  resources: { id: string; code: string; name: string; active: boolean }[];
  rates: RateData[];
  equipment: EquipmentData[];
  promos: PromoData[];
  policies: PolicyData[];
  exceptions: {
    date: string;
    closed: boolean;
    opensMinute: number | null;
    closesMinute: number | null;
    reason: string;
  }[];
}

export interface PaymentConfiguration {
  settings: {
    revision: number;
    mode: 'full' | 'deposit' | null;
    depositPercent: number | null;
    balanceBeforeMinutes: number | null;
    proofExtendsHold: boolean | null;
    reviewMinutes: number | null;
    cancellationText: string | null;
    reschedulingText: string | null;
  };
  channels: {
    kind: 'qr' | 'cash';
    id: string;
    name: string;
    accountName: string;
    accountNumber: string;
    instructions: string;
    active: boolean;
    hasQr: boolean;
  }[];
}
export interface OperationRow {
  paymentMethod?: 'qr' | 'cash';
  id: string;
  reference: string;
  customerName: string | null;
  status: string;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  holdUntil: string | null;
  totalCentavos: number | null;
  paidCentavos: number;
  balanceCentavos: number | null;
  checkedInAt: string | null;
  offering: { name: string };
  needsResolution: boolean;
}
export interface OperationDetail extends OperationRow {
  externalProofReceivedAt: string | null;
  externalProofReference: string | null;
  externalProofStatus: string | null;
  operationRevision: number;
  customerEmail: string | null;
  customerMobile: string | null;
  notes: string | null;
  requiredCentavos: number | null;
  proofs: {
    id: string;
    channelId: string;
    status: string;
    submittedAt: string;
    reviewReason: string | null;
  }[];
  ledger: {
    id: string;
    direction: string;
    amountCentavos: number;
    externalReference: string;
    reason: string;
    createdAt: string;
    channel: { name: string };
  }[];
  audit: { action: string; reason: string | null; createdAt: string }[];
}
export interface EventEnquiryData {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  preferredDate: string;
  durationMinutes: number;
  occasion: string;
  notes: string | null;
  policyId: string;
  status: string;
}
export interface PaymentInstructions {
  paymentMethod: 'qr' | 'cash';
  holdUntil: string | null;
  enabled: boolean;
  policy: {
    mode: string;
    requiredCentavos: number;
    proofExtendsHold: boolean;
    reviewMinutes: number;
  } | null;
  paidCentavos: number;
  balanceCentavos: number | null;
  channels: {
    kind: 'qr' | 'cash';
    id: string;
    name: string;
    accountName: string;
    accountNumber: string;
    instructions: string;
    qrDataUrl: string | null;
  }[];
  proofs: {
    id: string;
    status: string;
    submittedAt: string;
    reviewReason: string | null;
  }[];
}

export interface NotificationMonitor {
  mode: 'sandbox' | 'disabled' | 'resend';
  worker: {
    healthy: boolean;
    heartbeat: {
      lastSucceededAt: string | null;
      errorCode: string | null;
    } | null;
  };
  backup: { state: string; lastSucceededAt: string | null; offsite: boolean };
  failedDeliveryCount: number;
  counts: { state: string; _count: number }[];
  jobs: {
    id: string;
    kind: string;
    audience: string;
    state: string;
    attempts: number;
    generation: number;
    createdAt: string;
    nextAttemptAt: string;
    errorCode: string | null;
    deliveryStatus: string | null;
    completedAt: string | null;
  }[];
}
