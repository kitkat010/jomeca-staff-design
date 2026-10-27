import { Link } from 'react-router';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { HeroVideo } from '@/components/hero-video';
import { MotionText } from '@/components/home-motion';

export function HomeHero() {
  return (
    <section className="club-hero is-video wrap" aria-labelledby="home-title">
      <HeroVideo />
      <div className="club-hero-copy">
        <p className="club-eyebrow">
          <span aria-hidden="true" /> Mapandan, Pangasinan
        </p>
        <h1 id="home-title">
          <MotionText text="Where" />
          <br />
          <em>
            <MotionText text="memories" />
          </em>
          <br />
          <MotionText text="play." />
        </h1>
        <p className="club-intro">
          A good game. Your favorite people.
          <br />A little more to look forward to.
        </p>
        <div className="club-actions">
          <Link className="pill-button light" to="/reservations">
            Find your game <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
          <Link className="club-event-link" to="/gymnasium">
            Explore the gymnasium <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <a className="club-discover" href="#home-courts">
          <ArrowDown size={16} aria-hidden="true" /> Discover your kind of play
        </a>
      </div>
      <div className="club-hero-foot">
        <span>Sports. Celebrations. Your community.</span>
        <span>Where Memories Play.</span>
      </div>
    </section>
  );
}
