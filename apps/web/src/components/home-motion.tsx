import { useEffect, useRef, type CSSProperties } from 'react';

export function MotionText({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <span className="motion-text">
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className="motion-word"
            style={{ '--word-index': index } as CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

export function CountUp({ value }: { value: number }) {
  const root = useRef<HTMLElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const formatted = String(value).padStart(2, '0');

  useEffect(() => {
    const element = root.current;
    const display = digits.current;
    if (!element || !display) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let started = false;
    const finish = () => {
      window.cancelAnimationFrame(frame);
      display.textContent = formatted;
      element.style.setProperty('--count-progress', '1');
    };
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              if (started || !entries.some((entry) => entry.isIntersecting))
                return;
              started = true;
              observer?.disconnect();
              if (preference.matches) return finish();
              let start: number | undefined;
              const tick = (now: number) => {
                start ??= now;
                const progress = Math.min(1, (now - start) / 2200);
                const eased = 1 - Math.pow(1 - progress, 3);
                display.textContent = String(
                  Math.round(value * eased),
                ).padStart(2, '0');
                element.style.setProperty('--count-progress', String(eased));
                if (progress < 1) frame = window.requestAnimationFrame(tick);
              };
              frame = window.requestAnimationFrame(tick);
            },
            { threshold: 0.75 },
          )
        : null;
    observer?.observe(element);
    const syncPreference = () => {
      if (preference.matches) finish();
    };
    preference.addEventListener('change', syncPreference);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', syncPreference);
      window.cancelAnimationFrame(frame);
    };
  }, [value, formatted]);

  return (
    <strong className="fact-count" ref={root}>
      <span className="sr-only">{formatted}</span>
      <span className="fact-count-digits" aria-hidden="true" ref={digits}>
        {formatted}
      </span>
    </strong>
  );
}
