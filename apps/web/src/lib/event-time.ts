export function eventTimeWarnings({
  start,
  end,
  minMinutes,
  maxMinutes,
  increment,
  hours,
  conflicts,
}: {
  start: number;
  end: number;
  minMinutes: number;
  maxMinutes: number;
  increment: number;
  hours: { start: number; end: number }[];
  conflicts: { start: number; end: number }[];
}) {
  const warnings: string[] = [];
  const duration = end - start;
  if (duration <= 0)
    warnings.push(
      'Time out must be later than time in. Use midnight for the end of the selected day.',
    );
  else if (duration < minMinutes)
    warnings.push(
      `This event is too short. The minimum duration is ${minMinutes / 60} hours.`,
    );
  else if (duration > maxMinutes)
    warnings.push(
      `This event is too long. The maximum duration is ${maxMinutes / 60} hours.`,
    );
  if (start % increment || end % increment)
    warnings.push(`Choose times in ${increment}-minute increments.`);
  if (
    !hours.some((span) => start >= span.start && end <= span.end && end > start)
  )
    warnings.push(
      hours.length
        ? 'Your selected time must stay within the venue’s opening hours.'
        : 'The venue is closed on this date. Choose another date.',
    );
  if (
    end > start &&
    conflicts.some((span) => start < span.end && end > span.start)
  )
    warnings.push(
      'This time overlaps a held, booked or blocked period, including any configured setup/teardown allowance. Choose another time.',
    );
  return warnings;
}
