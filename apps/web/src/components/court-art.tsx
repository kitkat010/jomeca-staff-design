import type { Sport } from '@/content/site';

// Original schematic art. Not a photograph or representation of actual finishes.
export function CourtArt({
  sport = 'pickleball',
  className = '',
  decorative = false,
}: {
  sport?: Sport | 'events';
  className?: string;
  decorative?: boolean;
}) {
  const basketball = sport === 'basketball';
  const events = sport === 'events';
  const badminton = sport === 'badminton';
  return (
    <svg
      viewBox="0 0 760 560"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={
        decorative
          ? undefined
          : `${events ? 'Event space' : sport === 'basketball' ? 'Gymnasium' : sport} illustration, not a facility photograph`
      }
      aria-hidden={decorative || undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="760"
        height="560"
        fill={
          events
            ? '#203e39'
            : basketball
              ? '#db9073'
              : badminton
                ? '#91b5af'
                : '#b7c6ad'
        }
      />
      {Array.from({ length: 16 }, (_, n) => (
        <path
          key={n}
          d={`M${n * 60 - 120} 0L${n * 60 + 100} 560`}
          stroke={events ? '#37534a' : '#ffffff'}
          strokeOpacity=".07"
          strokeWidth="20"
        />
      ))}
      {events ? (
        <g>
          <path
            d="M140 442V210a240 240 0 01480 0v232"
            fill="none"
            stroke="#d7ecaa"
            strokeWidth="2"
          />
          <path
            d="M185 442V210a195 195 0 01390 0v232"
            fill="none"
            stroke="#d7ecaa"
            strokeOpacity=".3"
            strokeWidth="2"
          />
          <path d="M100 120Q380 240 660 120" fill="none" stroke="#e4d3a8" />
          {[150, 230, 310, 390, 470, 550, 630].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x} ${140 + Math.sin(i / 2) * 35}v20`}
                stroke="#e4d3a8"
              />
              <circle
                cx={x}
                cy={160 + Math.sin(i / 2) * 35}
                r="6"
                fill="#f4d891"
              />
            </g>
          ))}
          {[240, 380, 520].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="360" rx="47" ry="28" fill="#ecdfcb" />
              <path
                d={`M${x - 30} 340v70m60-70v70`}
                stroke="#c2b69e"
                strokeWidth="5"
              />
              <ellipse cx={x} cy="350" rx="47" ry="28" fill="#f6edda" />
              <circle cx={x} cy="347" r="8" fill="#a4bd6c" />
            </g>
          ))}
          <path d="M80 465H680" stroke="#cee38e" strokeWidth="2" />
        </g>
      ) : (
        <g transform="translate(100 65)">
          <rect
            x="0"
            y="0"
            width="560"
            height="430"
            rx="2"
            fill={basketball ? '#ba7359' : badminton ? '#386a60' : '#456b55'}
          />
          {!basketball && (
            <>
              <rect
                x="30"
                y="30"
                width="500"
                height="370"
                fill={badminton ? '#477c6b' : '#244f43'}
              />
              <rect
                x="210"
                y="30"
                width="140"
                height="370"
                fill={badminton ? '#477c6b' : '#a6b777'}
              />
            </>
          )}
          <g
            stroke={basketball ? '#fff2d6' : '#f6f1df'}
            strokeWidth="3"
            fill="none"
          >
            <rect x="30" y="30" width="500" height="370" />
            <path d="M280 30V400" />
            {basketball ? (
              <>
                <circle cx="280" cy="215" r="59" />
                <path d="M30 140H130V290H30m500-150H430V290H530" />
                <path d="M30 62Q330 215 30 368M530 62Q230 215 530 368" />
                <path d="M45 198v34m470-34v34" strokeWidth="7" />
                <circle cx="61" cy="215" r="8" />
                <circle cx="499" cy="215" r="8" />
              </>
            ) : (
              <>
                <path d="M30 215H210m140 0H530M210 30V400M350 30V400" />
                {badminton && (
                  <path
                    d="M30 60H530M30 370H530M70 30V400M490 30V400"
                    strokeWidth="2"
                  />
                )}
              </>
            )}
          </g>
          {!basketball && (
            <g>
              <path d="M280 13V417" stroke="#172e29" strokeWidth="9" />
              <path
                d="M275 13V417"
                stroke="#fcf8e8"
                strokeWidth="2"
                strokeDasharray="3 4"
              />
            </g>
          )}
          <path
            d="M-14 445h75m453 0h75"
            stroke="#f8f2df"
            strokeOpacity=".7"
            strokeWidth="2"
          />
        </g>
      )}
      {!events && (
        <g transform={basketball ? 'translate(550 385)' : 'translate(565 113)'}>
          <ellipse cx="9" cy="11" rx="24" ry="9" fill="#142f26" opacity=".22" />
          <circle
            r={basketball ? '24' : '17'}
            fill={basketball ? '#7f3d25' : '#d9f065'}
          />
          {basketball ? (
            <g stroke="#d59c6b" fill="none">
              <path d="M-24 0H24M0-24V24M-17-17Q15 0-17 17M17-17Q-15 0 17 17" />
            </g>
          ) : (
            <g fill="#839d2c">
              <circle cx="-5" cy="-6" r="2" />
              <circle cx="7" cy="-4" r="2" />
              <circle cx="1" cy="8" r="2" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
