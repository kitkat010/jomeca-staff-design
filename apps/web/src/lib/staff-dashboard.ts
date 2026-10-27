import type { OperationRow } from '@jomeca/shared';
import { manilaDate, shiftDate } from './planning';

export function prioritizePending(rows: OperationRow[]) {
  return [...rows].sort(
    (a, b) =>
      Number(b.status === 'pending') - Number(a.status === 'pending') ||
      new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime() ||
      a.reference.localeCompare(b.reference),
  );
}

export function summarizeReservations(
  rows: OperationRow[],
  from: string,
  days: number,
) {
  const daily = Array.from({ length: days }, (_, index) => {
    const date = shiftDate(from, index);
    const matching = rows.filter(
      (row) => manilaDate(new Date(row.startsAt)) === date,
    );
    return {
      date,
      total: matching.length,
      confirmed: matching.filter((row) => row.status === 'confirmed').length,
      receivedCentavos: matching.reduce(
        (sum, row) => sum + row.paidCentavos,
        0,
      ),
    };
  });
  return {
    daily,
    total: rows.length,
    confirmed: rows.filter((row) => row.status === 'confirmed').length,
    pending: rows.filter((row) => row.status === 'pending').length,
    resolution: rows.filter((row) => row.needsResolution).length,
    receivedCentavos: rows.reduce((sum, row) => sum + row.paidCentavos, 0),
    statuses: [
      'confirmed',
      'pending',
      'completed',
      'cancelled',
      'expired',
      'rejected',
    ].map((status) => ({
      status,
      count: rows.filter((row) => row.status === status).length,
    })),
  };
}
