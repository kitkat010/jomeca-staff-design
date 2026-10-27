import { EditorialHero } from '@/components/editorial-hero';
import { useState } from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { site } from '@/content/site';
import { ContactBand } from '@/components/public-ui';

export function CommunityPage() {
  const [category, setCategory] = useState('All updates');
  return (
    <>
      <EditorialHero
        label="Leagues & announcements"
        title="Good things bring us together."
        kind="events"
        anchor="#community-updates"
        action="Explore updates"
      >
        The place for future leagues, tournaments, promotions, and news from the
        Jomeca community.
      </EditorialHero>
      <section className="wrap page-section" id="community-updates">
        <div className="filter-row" aria-label="Filter updates">
          {[
            'All updates',
            'Tournaments',
            'Leagues',
            'Announcements',
            'Promotions',
          ].map((item) => (
            <button
              key={item}
              className="filter-button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="empty-state community-empty" role="status">
          <CalendarDays size={44} strokeWidth={1.2} aria-hidden="true" />
          <p className="section-label">
            {category === 'All updates' ? 'Watch this space' : category}
          </p>
          <h2>
            Our next chapter
            <br />
            is on its way.
          </h2>
          <p>
            {category === 'All updates'
              ? 'There are no published updates yet.'
              : `No ${category.toLowerCase()} have been published yet.`}{' '}
            Approved details and dates will appear here when they’re ready.
          </p>
          <a
            className="pill-button"
            href={site.facebook}
            target="_blank"
            rel="noreferrer"
          >
            Follow Jomeca on Facebook{' '}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
