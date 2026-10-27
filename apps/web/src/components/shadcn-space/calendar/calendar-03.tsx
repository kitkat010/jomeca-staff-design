// Adapted from free Shadcn Space calendar-03 (MIT). Slots come from the API.
import type { ReactNode } from 'react';

export function CalendarThree({
  calendar,
  times,
}: {
  calendar: ReactNode;
  times: ReactNode;
}) {
  return (
    <div className="appointment-picker">
      <div className="appointment-date">{calendar}</div>
      <div className="appointment-times">{times}</div>
    </div>
  );
}
