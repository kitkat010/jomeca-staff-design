import { EditorialHero } from '@/components/editorial-hero';
import { Link } from 'react-router';
import { ArrowUpRight, Heart, Users, CircleDot } from 'lucide-react';
import { StockPhoto } from '@/components/stock-photo';
import { ContactBand } from '@/components/public-ui';

export function AboutPage() {
  return (
    <>
      <EditorialHero
        label="Our story"
        title="Made for a little more together."
        kind="pickleball"
        anchor="#story-details"
        action="Discover our story"
      >
        Jomeca Center is a community hub for sports and events in Mapandan,
        Pangasinan. A place for familiar faces, new playing partners, and shared
        occasions.
      </EditorialHero>
      <section className="wrap about-statement" id="story-details">
        <div className="about-art">
          <StockPhoto kind="basketball" />
        </div>
        <div>
          <p className="section-label">Where Memories Play.</p>
          <h2>
            Some of the best
            <br />
            moments start
            <br />
            <em>with “tara, laro.”</em>
          </h2>
          <p>
            A game with friends. A regular catch-up on the court. A gathering
            that brings everyone into the same room. We want to make more space
            for those everyday moments.
          </p>
          <p>
            With a gymnasium, badminton and pickleball courts, Jomeca brings
            different reasons to get together under one community hub.
          </p>
          <Link className="pill-button" to="/facilities">
            Find your space <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="section wrap">
        <div className="values-grid">
          {[
            {
              icon: Users,
              title: 'A place for your people',
              text: 'Come with your regular group, bring your family, or meet someone across the net.',
            },
            {
              icon: CircleDot,
              title: 'Play your way',
              text: 'Three sports and six courts give you more than one way to make time for a game.',
            },
            {
              icon: Heart,
              title: 'More than a match',
              text: 'Our flexible event space makes room for celebrations and community gatherings, too.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={29} strokeWidth={1.4} aria-hidden="true" />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactBand />
    </>
  );
}
