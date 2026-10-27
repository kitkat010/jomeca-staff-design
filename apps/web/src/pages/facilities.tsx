import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowUpRight, Clock3, LayoutGrid } from 'lucide-react';
import { facilities, site, type Sport } from '@/content/site';
import { stockMedia } from '@/content/media';
import { StockPhoto } from '@/components/stock-photo';
import { HomeReveals } from '@/components/home-reveals';
import { MotionText } from '@/components/home-motion';
import { Notice, ContactBand } from '@/components/public-ui';

export function FacilitiesPage() {
  const [filter, setFilter] = useState<Sport | 'all'>('all');
  const visible = facilities.filter(
    (item) => filter === 'all' || item.id === filter,
  );
  const courtCount = visible.reduce((total, item) => total + item.count, 0);
  return (
    <HomeReveals className="facilities-reference">
      <section
        className="facilities-hero wrap"
        aria-labelledby="facilities-title"
      >
        <div className="facilities-hero-copy">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Courts & rates</span>
          </nav>
          <p className="section-label">A little time for your game</p>
          <h1 id="facilities-title">
            <MotionText text="Find your court." />
            <br />
            <em>
              <MotionText text="Make it your game." />
            </em>
          </h1>
          <p>
            Six courts. Three sports. Bring your regular crew or make room for
            someone new.
          </p>
          <div className="facilities-hero-actions">
            <a className="pill-button light" href="#facility-courts">
              Explore the courts <ArrowDown size={18} aria-hidden="true" />
            </a>
            <Link to="/reservations" className="facilities-quiet-link">
              View the schedule <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="facilities-hours">
            <Clock3 size={17} aria-hidden="true" />
            <span>
              {site.days} · {site.hours}
              <small>
                Philippine time · Confirm special closures with our team
              </small>
            </span>
          </div>
        </div>
        <div
          className="facilities-hero-photos"
          aria-label="Gymnasium, badminton and pickleball"
        >
          {(['basketball', 'badminton', 'pickleball'] as const).map((kind) => (
            <div key={kind}>
              <StockPhoto
                kind={kind}
                priority
                sizes="(max-width: 700px) 33vw, 18vw"
              />
              <span>{stockMedia[kind].name}</span>
            </div>
          ))}
        </div>
      </section>
      <section
        className="wrap page-section facilities-courts"
        id="facility-courts"
        aria-labelledby="courts-heading"
      >
        <div className="section-heading" data-home-reveal>
          <div>
            <p className="section-label">Find your kind of play</p>
            <h2 id="courts-heading">
              <MotionText text="One place." />
              <br />
              <em>
                <MotionText text="Plenty of ways to play." />
              </em>
            </h2>
          </div>
          <p className="facilities-section-note">
            Choose a sport, meet your court, then check the schedule.
          </p>
        </div>
        <div
          className="filter-row facilities-filters"
          role="group"
          aria-label="Filter facilities"
        >
          <button
            type="button"
            className="filter-button"
            aria-pressed={filter === 'all'}
            aria-controls="facility-results"
            onClick={() => setFilter('all')}
          >
            <LayoutGrid size={16} aria-hidden="true" />
            All courts<span>06</span>
          </button>
          {facilities.map((item) => (
            <button
              type="button"
              key={item.id}
              className="filter-button"
              aria-pressed={filter === item.id}
              aria-controls="facility-results"
              onClick={() => setFilter(item.id)}
            >
              {item.name}
              <span>{String(item.count).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <p className="facilities-results-note" role="status">
          {visible.length === 1 ? visible[0]!.name : `${visible.length} sports`}{' '}
          · {courtCount} {courtCount === 1 ? 'court' : 'courts'}
        </p>
        <div
          className={`facility-grid ${filter === 'all' ? '' : 'is-filtered'}`}
          id="facility-results"
        >
          {visible.map((item) => (
            <article className="facility-card" key={item.id}>
              <div className="facility-card-art">
                <StockPhoto
                  kind={item.id}
                  sizes={
                    filter === 'all'
                      ? '(max-width: 700px) 100vw, 33vw'
                      : '(max-width: 700px) 100vw, 50vw'
                  }
                />
                <span>
                  {item.count} {item.count === 1 ? 'court' : 'courts'}
                </span>
              </div>
              <div className="facility-card-copy">
                <p className="section-label">{item.descriptor}</p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="facility-note">{item.note}</p>
                <div className="facility-card-foot">
                  <div>
                    <small>Hourly pricing</small>
                    <strong>Rates to be announced</strong>
                  </div>
                  <Link
                    to={
                      item.id === 'basketball'
                        ? '/gymnasium'
                        : `/reservations?court=${item.id}-1`
                    }
                    aria-label={`View ${item.name} schedule`}
                    className="pill-button"
                  >
                    View schedule
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="facilities-pricing-note">
          <Notice title="Good games start with clear details">
            <p>
              Court rates, peak schedules, member pricing and equipment rental
              prices are being finalized. Online checkout stays closed until the
              required prices and booking policies are approved and configured.
              Checking the schedule does not hold a court.
            </p>
          </Notice>
        </div>
      </section>
      <section
        className="facilities-event wrap"
        data-home-reveal
        aria-labelledby="facilities-events-title"
      >
        <div className="facilities-event-photo">
          <StockPhoto kind="events" />
        </div>
        <div className="facilities-event-copy">
          <p className="section-label">One space, more possibilities</p>
          <h2 id="facilities-events-title">
            <MotionText text="From game day" />
            <br />
            <em>
              <MotionText text="to your big day." />
            </em>
          </h2>
          <p>
            The gymnasium is one shared venue for games and events. Event
            arrangements include time for setup and teardown as well as the
            event itself.
          </p>
          <p className="facilities-event-note">
            Start with an enquiry. Our team reviews the arrangements; an enquiry
            does not hold the venue.
          </p>
          <Link className="pill-button light" to="/gymnasium">
            Explore the gymnasium
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <ContactBand />
    </HomeReveals>
  );
}
