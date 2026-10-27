import { useEffect, useRef } from 'react';
import { StockPhoto } from '@/components/stock-photo';
import type { StockMediaKey } from '@/content/media';

const rows: StockMediaKey[][] = [
  ['basketball', 'badminton', 'pickleball', 'events'],
  ['events', 'pickleball', 'basketball', 'badminton'],
  ['badminton', 'basketball', 'events', 'pickleball'],
];

export function ScrollGallery() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastProgress = '';
    const update = () => {
      frame = 0;
      if (preference.matches) {
        element.style.removeProperty('--gallery-progress');
        lastProgress = '';
        return;
      }
      const bounds = element.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(
          0,
          (window.innerHeight - bounds.top) /
            (window.innerHeight + bounds.height),
        ),
      ).toFixed(4);
      if (progress !== lastProgress) {
        element.style.setProperty('--gallery-progress', progress);
        lastProgress = progress;
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    const observer =
      'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    observer?.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      className="scroll-gallery"
      ref={root}
      aria-label="Sports and celebrations"
    >
      {rows.map((row, rowIndex) => (
        <div className="scroll-gallery-window" key={rowIndex}>
          <div
            className="scroll-gallery-track"
            data-direction={rowIndex === 1 ? 'left' : 'right'}
          >
            {[...row, ...row, ...row].map((kind, index) => (
              <div
                className="scroll-gallery-photo"
                key={`${kind}-${index}`}
                aria-hidden={index >= row.length ? true : undefined}
              >
                <StockPhoto
                  kind={kind}
                  sizes="(max-width: 730px) 190px, 360px"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
