import { useEffect, useState } from 'react';

const clock = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

export function StaffClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="staff-live-clock">
      <span>PH time</span>
      <time dateTime={now.toISOString()} aria-label="Current Philippine time">
        {clock.format(now)}
      </time>
    </div>
  );
}
