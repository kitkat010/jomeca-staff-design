export function manilaDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)!.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function shiftDate(date: string, days: number) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function emailLink(subject: string, lines: string[]) {
  return `mailto:jomecacenter@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export function addCalendarMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const first = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  first.setUTCDate(Math.min(day, lastDay));
  return first.toISOString().slice(0, 10);
}

export function endLabel(hour: number, duration: number) {
  const end = hour + duration;
  if (end === 24) return '12 midnight (next-day boundary)';
  return `${end > 12 ? end - 12 : end}:00 ${end >= 12 ? 'PM' : 'AM'}`;
}
