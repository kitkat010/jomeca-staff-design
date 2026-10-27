// shadcn/ui Calendar composition; retains the existing button primitives.
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import 'react-day-picker/style.css';

export function Calendar({ className, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      fixedWeeks
      className={cn('booking-calendar', className)}
      {...props}
    />
  );
}
