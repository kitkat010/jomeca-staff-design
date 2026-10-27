// Adapted from the free Shadcn Space calendar-02 (MIT). No random booked days.
import { Calendar } from '@/components/ui/calendar';
import { manilaDate } from '@/lib/planning';

export function CalendarTwo({
  value,
  min,
  max,
  disabled,
  onChange,
  month,
  onMonthChange,
  busyDates = [],
}: {
  value: string;
  min: string;
  max: string;
  disabled: boolean;
  onChange: (date: string) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  busyDates?: string[];
}) {
  const asDate = (day: string) => new Date(`${day}T12:00:00+08:00`);
  return (
    <Calendar
      mode="single"
      required
      timeZone="Asia/Manila"
      selected={value ? asDate(value) : undefined}
      defaultMonth={asDate(value || min)}
      month={month}
      onMonthChange={onMonthChange}
      modifiers={{ busy: busyDates.map(asDate) }}
      modifiersClassNames={{ busy: 'event-busy-day' }}
      today={asDate(manilaDate())}
      startMonth={asDate(min)}
      endMonth={asDate(max)}
      disabled={
        disabled ? true : [{ before: asDate(min) }, { after: asDate(max) }]
      }
      onSelect={(day) => {
        if (day) onChange(manilaDate(day));
      }}
      aria-label="Preferred date, Philippine time"
    />
  );
}
