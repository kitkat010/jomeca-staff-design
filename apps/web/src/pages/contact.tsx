import { EditorialHero } from '@/components/editorial-hero';
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { site } from '@/content/site';

export function ContactPage() {
  const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
  return (
    <>
      <EditorialHero
        label="Visit & contact"
        title="See you in Mapandan."
        kind="badminton"
        anchor="#visit-details"
        action="Plan your visit"
      >
        A game, a gathering, or just a question before your first visit. We’d
        love to hear from you.
      </EditorialHero>
      <section className="wrap page-section contact-grid" id="visit-details">
        <div className="contact-info">
          <div>
            <MapPin size={23} aria-hidden="true" />
            <h2>Find us here</h2>
            <p>{site.address}</p>
            <a
              className="text-link"
              href={mapSearch}
              target="_blank"
              rel="noreferrer"
            >
              Search this address in Maps{' '}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <p className="field-hint">
              Address search only. A verified map pin will be added when
              supplied.
            </p>
          </div>
          <div>
            <Clock3 size={23} aria-hidden="true" />
            <h2>Time for a little play</h2>
            <p>
              {site.hours}
              <br />
              {site.days} · Philippine time
            </p>
            <p className="field-hint">
              Current hours; contact us for holidays or special closures.
            </p>
          </div>
          <div>
            <Phone size={23} aria-hidden="true" />
            <h2>Give us a call</h2>
            <a href={site.phoneHref}>{site.phone}</a>
          </div>
          <div>
            <Mail size={23} aria-hidden="true" />
            <h2>Write to our team</h2>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
        <div className="location-card">
          <div
            className="location-graphic"
            role="img"
            aria-label="Decorative location illustration, not a map"
          >
            <div className="location-road one" />
            <div className="location-road two" />
            <div className="location-road three" />
            <div className="location-marker">
              <MapPin size={37} fill="currentColor" stroke="var(--lime)" />
              <span>jomeca center</span>
            </div>
            <span className="location-town">Mapandan</span>
          </div>
          <div>
            <p className="section-label">Let’s stay in touch</p>
            <h2>
              Your next visit
              <br />
              starts with hello.
            </h2>
            <p>
              For current court information and event enquiries, reach out
              directly. Online reservations are not open yet.
            </p>
            <a
              className="pill-button"
              href={site.facebook}
              target="_blank"
              rel="noreferrer"
            >
              Find us on Facebook <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
