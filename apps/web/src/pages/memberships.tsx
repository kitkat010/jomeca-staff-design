import { EditorialHero } from '@/components/editorial-hero';
import { ArrowUpRight, CircleDot, Package, Users } from 'lucide-react';
import { site } from '@/content/site';
import { Notice, ContactBand } from '@/components/public-ui';

export function MembershipsPage() {
  return (
    <>
      <EditorialHero
        label="Membership & packages"
        title="Make it a regular thing."
        kind="pickleball"
        anchor="#membership-details"
        action="Explore what’s planned"
      >
        Membership options, rental equipment, and event packages are being
        shaped around the way our community plays and gathers.
      </EditorialHero>
      <section className="wrap page-section" id="membership-details">
        <div className="offer-grid">
          {[
            {
              Icon: Users,
              title: 'Membership',
              status: 'Benefits & eligibility to be announced',
              text: 'Member pricing and plan details are being finalized. Contact our team for membership enquiries.',
            },
            {
              Icon: CircleDot,
              title: 'Equipment rentals',
              status: 'Equipment list & rates to follow',
              text: 'Balls and rackets are planned as optional add-ons. Specific items, quantities, and rental packages will be published once approved.',
            },
            {
              Icon: Package,
              title: 'Event packages',
              status: 'Packages & inclusions to be confirmed',
              text: 'Tell us about your occasion. Our team will confirm what can be arranged before quoting any package or accepting payment.',
            },
          ].map(({ Icon, title, status, text }) => (
            <article key={title}>
              <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
              <h2>{title}</h2>
              <span className="status-label">Coming soon</span>
              <h3>{status}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <Notice title="No unannounced prices or commitments">
          <p>
            We will publish approved benefits, eligibility, prices, and terms
            here. For a current enquiry,{' '}
            <a href={site.phoneHref}>call {site.phone}</a> or{' '}
            <a href={`mailto:${site.email}`}>
              email our team{' '}
              <ArrowUpRight size={14} className="inline" aria-hidden="true" />
            </a>
            .
          </p>
        </Notice>
      </section>
      <ContactBand />
    </>
  );
}
