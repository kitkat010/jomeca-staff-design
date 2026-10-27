import { Link } from 'react-router';
import { ArrowUpRight, MapPin, Clock3 } from 'lucide-react';
import { HomeHero } from '@/components/home-hero';
import { HomeReveals } from '@/components/home-reveals';
import { CountUp, MotionText } from '@/components/home-motion';
import { ScrollGallery } from '@/components/scroll-gallery';
import { SportsRibbon } from '@/components/sports-ribbon';
import { StockPhoto } from '@/components/stock-photo';
import { CourtShowcase } from '@/components/shadcn-space/blocks/services-02/services';
import { ContactBand, FaqList, TextLink } from '@/components/public-ui';
import { site } from '@/content/site';

export function HomePage() {
  return (
    <HomeReveals>
      <HomeHero />
      <SportsRibbon />
      <section className="intro-section wrap" data-home-reveal>
        <p className="section-label">A place for your people</p>
        <div>
          <h2>
            <MotionText text="A friendly match." />
            <br />
            <MotionText text="A big celebration." />
            <br />
            <em>
              <MotionText text="A reason to get together." />
            </em>
          </h2>
          <p>
            Jomeca Center is a community hub for sports and events in the heart
            of Mapandan. Come for the game, bring your people, and make a little
            more room for good memories.
          </p>
          <TextLink to="/about">Get to know Jomeca</TextLink>
        </div>
        <div className="facts">
          <Link to="/facilities" className="fact-link">
            <CountUp value={6} />
            <span>Courts and a shared gymnasium</span>
          </Link>
          <Link to="/contact" className="fact-link">
            <CountUp value={7} />
            <span>Days a week to get together</span>
          </Link>
          <Link to="/gymnasium" className="fact-link">
            <CountUp value={1} />
            <span>Gymnasium for games and gatherings</span>
          </Link>
        </div>
      </section>
      <div id="home-courts" data-home-reveal>
        <CourtShowcase stock />
      </div>
      <section className="events-feature wrap" data-home-reveal>
        <div className="event-art home-event-photo">
          <StockPhoto kind="events" />
        </div>
        <div className="event-feature-copy">
          <p className="section-label">Beyond the game</p>
          <h2>
            <MotionText text="Same space." />
            <br />
            <em>
              <MotionText text="A whole new occasion." />
            </em>
          </h2>
          <p>
            From celebrations to community gatherings, our gymnasium transforms
            into a place for your next shared moment. Tell us what you have in
            mind.
          </p>
          <Link className="pill-button light" to="/gymnasium">
            Explore the gymnasium <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
          <span className="event-fine">
            Event packages and setup details are being finalized.
          </span>
        </div>
      </section>
      <section
        className="section home-moments home-scroll-moments"
        aria-labelledby="home-gallery-title"
      >
        <div className="section-heading wrap" data-home-reveal>
          <div>
            <p className="section-label">A little inspiration</p>
            <h2 id="home-gallery-title">
              <MotionText text="More than a game." />
              <br />
              <em>
                <MotionText text="A reason to gather." />
              </em>
            </h2>
          </div>
          <TextLink to="/gallery">Explore the gallery</TextLink>
        </div>
        <ScrollGallery />
      </section>
      <section className="section wrap visit-home" data-home-reveal>
        <div>
          <p className="section-label">Right here in Mapandan</p>
          <h2>
            <MotionText text="A little closer" />
            <br />
            <MotionText text="to your next game." />
          </h2>
          <p className="muted">{site.address}</p>
          <TextLink to="/contact">Plan your visit</TextLink>
        </div>
        <div className="visit-details">
          <div>
            <Clock3 size={24} aria-hidden="true" />
            <span>
              <strong>{site.hours}</strong>
              <span>{site.days} · Philippine time</span>
            </span>
          </div>
          <div>
            <MapPin size={24} aria-hidden="true" />
            <span>
              <strong>Mapandan Town Center</strong>
              <span>Poblacion, Mapandan, Pangasinan</span>
            </span>
          </div>
          <p>
            Have a question before you visit?{' '}
            <a href={site.phoneHref}>Call {site.phone}</a>.
          </p>
        </div>
      </section>
      <section className="faq-section" data-home-reveal>
        <div className="wrap faq-grid">
          <div>
            <p className="section-label">A few things to know</p>
            <h2>
              <MotionText text="Before you" />
              <br />
              <MotionText text="bring your game." />
            </h2>
            <TextLink to="/faqs">All FAQs & policies</TextLink>
          </div>
          <FaqList limit={4} />
        </div>
      </section>
      <section className="section wrap community-note">
        <div>
          <p className="section-label">More to look forward to</p>
          <h2>
            Keep the community
            <br />
            <em>in your calendar.</em>
          </h2>
        </div>
        <div>
          <p>
            Leagues, tournaments, and announcements will have a home here. No
            dates have been announced yet—follow along for news from our team.
          </p>
          <TextLink to="/events">Community updates</TextLink>
        </div>
      </section>
      <ContactBand />
    </HomeReveals>
  );
}
