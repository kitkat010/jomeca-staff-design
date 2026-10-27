import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { sportsHero } from '@/content/media';

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setMotionAllowed(!preference.matches);
    const syncVisibility = () => setVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener('change', syncPreference);
    document.addEventListener('visibilitychange', syncVisibility);
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) =>
            setInView(!!entry?.isIntersecting),
          )
        : null;
    if (root.current) observer?.observe(root.current);
    return () => {
      preference.removeEventListener('change', syncPreference);
      document.removeEventListener('visibilitychange', syncVisibility);
      observer?.disconnect();
    };
  }, []);

  const shouldPlay =
    motionAllowed && inView && visible && !pausedByUser && !failed;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (shouldPlay) void element.play().catch(() => setBlocked(true));
    else element.pause();
    return () => element.pause();
  }, [shouldPlay]);

  function togglePlayback() {
    if (playing) {
      setPausedByUser(true);
      video.current?.pause();
    } else {
      setPausedByUser(false);
      setBlocked(false);
      void video.current?.play().catch(() => setBlocked(true));
    }
  }

  return (
    <div className="club-hero-media" ref={root}>
      <img
        src={sportsHero.poster}
        alt="Sunlit gymnasium floor and tall windows"
        width={960}
        height={540}
        fetchPriority="high"
      />
      {motionAllowed && !failed && (
        <video
          ref={video}
          className="hero-loop"
          src={sportsHero.src}
          poster={sportsHero.poster}
          autoPlay={shouldPlay}
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlay={() => {
            setPlaying(true);
            setBlocked(false);
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
      )}
      <div className="club-hero-bottom">
        <div className="hero-sports-label">
          <span>Gymnasium / Badminton / Pickleball</span>
          <small>
            {failed
              ? 'Video unavailable · Still image shown'
              : !motionAllowed
                ? 'Still image · Reduced motion'
                : blocked
                  ? 'Select play to start the video'
                  : 'A little inspiration for your next game'}
          </small>
        </div>
        {motionAllowed && !failed && (
          <button
            className="film-trigger hero-playback"
            onClick={togglePlayback}
            aria-label={
              playing ? 'Pause background video' : 'Play background video'
            }
          >
            {playing ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
            <span>{playing ? 'Pause video' : 'Play video'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
