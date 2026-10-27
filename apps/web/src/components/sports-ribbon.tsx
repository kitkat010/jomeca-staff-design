import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Building2 } from 'lucide-react';

type Glyph =
  'basketball' | 'hoop' | 'racket' | 'shuttlecock' | 'paddle' | 'pickleball';

function SportsGlyph({ kind }: { kind: Glyph }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'basketball' && (
        <>
          <circle cx="24" cy="24" r="17" />
          <path d="M7 24h34M24 7v34M12 12c17 5 7 19 24 24M36 12c-17 5-7 19-24 24" />
        </>
      )}
      {kind === 'hoop' && (
        <>
          <rect x="6" y="5" width="36" height="22" rx="2" />
          <path d="M18 23v-9h12v9M14 29l4 13h12l4-13M17 33l14 6M31 33l-12 6M23 30l-1 12M27 30l1 12" />
          <ellipse cx="24" cy="27" rx="12" ry="3" />
        </>
      )}
      {kind === 'racket' && (
        <g transform="rotate(30 24 24)">
          <ellipse cx="24" cy="17" rx="12" ry="14" />
          <path d="M18 6v22M24 3v28M30 6v22M13 12h22M12 18h24M15 24h18M21 31v12h6V31M21 37h6" />
        </g>
      )}
      {kind === 'shuttlecock' && (
        <g transform="rotate(25 24 24)">
          <path d="M18 31L8 7l8 3 8-6 8 6 8-3-10 24M16 10l6 21M24 4v27M32 10l-6 21M14 22h20M18 31h12v5a6 6 0 01-12 0z" />
        </g>
      )}
      {kind === 'paddle' && (
        <g transform="rotate(25 24 24)">
          <path d="M13 5c6-3 16-3 22 0 3 5 3 16-1 21l-7 6v11h-6V32l-7-6c-4-5-4-16-1-21zM15 10h18M21 36h6M21 40h6" />
        </g>
      )}
      {kind === 'pickleball' && (
        <>
          <circle cx="24" cy="24" r="17" />
          <circle cx="19" cy="14" r="2" />
          <circle cx="30" cy="16" r="2" />
          <circle cx="13" cy="24" r="2" />
          <circle cx="24" cy="25" r="2" />
          <circle cx="35" cy="26" r="2" />
          <circle cx="19" cy="35" r="2" />
          <circle cx="29" cy="35" r="2" />
        </>
      )}
    </svg>
  );
}

export function SportsRibbon() {
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) =>
            element.toggleAttribute('data-ribbon-away', !entry?.isIntersecting),
          )
        : null;
    observer?.observe(element);
    const syncVisibility = () =>
      element.toggleAttribute('data-ribbon-hidden', document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);
  return (
    <section
      className="sport-ribbon moving-sports-ribbon"
      aria-label="Sports and celebrations"
      ref={root}
      data-paused={paused}
    >
      <p className="sr-only">Gymnasium, badminton and pickleball.</p>
      <div className="sports-ribbon-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="sports-ribbon-group" key={copy}>
            <span>
              <Building2 strokeWidth={1.7} aria-hidden="true" />
              Gymnasium
            </span>
            <span>
              <SportsGlyph kind="racket" />
              Badminton
              <SportsGlyph kind="shuttlecock" />
            </span>
            <span>
              <SportsGlyph kind="paddle" />
              Pickleball
              <SportsGlyph kind="pickleball" />
            </span>
          </div>
        ))}
      </div>
      <button
        className="sports-ribbon-toggle"
        type="button"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? 'Resume sports ribbon' : 'Pause sports ribbon'}
        aria-pressed={paused}
      >
        {paused ? (
          <Play size={16} aria-hidden="true" />
        ) : (
          <Pause size={16} aria-hidden="true" />
        )}
      </button>
    </section>
  );
}
