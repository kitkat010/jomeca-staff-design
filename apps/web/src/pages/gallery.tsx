// Adapted from the supplied Shadcn Space gallery-05 lightbox composition.
// Licensed stock grid and accessible lightboxes. See media register and notices.
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Expand } from 'lucide-react';
import { StockPhoto } from '@/components/stock-photo';
import { EditorialHero } from '@/components/editorial-hero';
import { sportsHero } from '@/content/media';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ContactBand } from '@/components/public-ui';
import { type Sport, site } from '@/content/site';

const galleryItems: {
  id: Sport | 'events';
  title: string;
  category: 'Sports' | 'Events';
  note: string;
}[] = [
  {
    id: 'pickleball',
    title: 'A little friendly competition',
    category: 'Sports',
    note: 'Four pickleball courts are part of the confirmed facility inventory.',
  },
  {
    id: 'basketball',
    title: 'Bring the whole team',
    category: 'Sports',
    note: 'One gymnasium accommodates games, celebrations and community gatherings.',
  },
  {
    id: 'badminton',
    title: 'Meet you across the net',
    category: 'Sports',
    note: 'One badminton court is part of the confirmed facility inventory.',
  },
  {
    id: 'events',
    title: 'An occasion to remember',
    category: 'Events',
    note: 'Event layout, capacity, and package inclusions need staff confirmation.',
  },
];

export function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [filmFailed, setFilmFailed] = useState(false);
  const film = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = film.current;
    if (!element) return;
    const hide = () => {
      if (document.hidden) element.pause();
    };
    document.addEventListener('visibilitychange', hide);
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) element.pause();
          })
        : null;
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', hide);
      element.pause();
    };
  }, []);
  return (
    <>
      <EditorialHero
        label="Gallery"
        title="A little inspiration. A lot of possibilities."
        kind="basketball"
        anchor="#gallery-collection"
        action="Explore the collection"
      >
        A few glimpses of the games and occasions that bring us together.
      </EditorialHero>
      <section className="wrap page-section" id="gallery-collection">
        <div className="gallery-introduction">
          <div>
            <p className="section-label">The collection</p>
            <h2>Find your kind of moment.</h2>
          </div>
          <p>
            Choose a category. Open a photograph for a closer look and its
            context.
          </p>
        </div>
        <div className="filter-row" aria-label="Filter gallery">
          {['All', 'Sports', 'Events'].map((item) => (
            <button
              key={item}
              className="filter-button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {galleryItems
            .filter((item) => filter === 'All' || item.category === filter)
            .map((item) => (
              <Dialog key={item.id}>
                <div className="gallery-entry">
                  <DialogTrigger asChild>
                    <button
                      className="gallery-trigger"
                      aria-label={`View photograph: ${item.title}`}
                    >
                      <StockPhoto kind={item.id} />
                      <span className="gallery-expand">
                        <Expand size={19} aria-hidden="true" />
                      </span>
                    </button>
                  </DialogTrigger>
                  <div className="gallery-caption">
                    <h2>{item.title}</h2>
                    <span>{item.category}</span>
                  </div>
                </div>
                <DialogContent className="gallery-dialog">
                  <StockPhoto kind={item.id} />
                  <div className="gallery-dialog-copy">
                    <DialogTitle className="dialog-heading">
                      {item.title}
                    </DialogTitle>
                    <DialogDescription>{item.note}</DialogDescription>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
        </div>
        <section className="gallery-film" aria-labelledby="gallery-film-title">
          <div>
            <p className="section-label">Three sports. One shared energy.</p>
            <h2 id="gallery-film-title">A moment in motion.</h2>
            <p>Gymnasium, badminton and pickleball. Find your next game.</p>
          </div>
          <video
            ref={film}
            onError={() => setFilmFailed(true)}
            controls
            playsInline
            preload="none"
            poster={sportsHero.poster}
            aria-label="Gymnasium, badminton and pickleball film"
          >
            <source src={sportsHero.src} type="video/mp4" />
            <p>
              Your browser cannot play this video. The photo collection above
              remains available.
            </p>
          </video>
          {filmFailed && (
            <p role="status">
              The film is unavailable. You can still explore the photo
              collection above.
            </p>
          )}
        </section>
        <p className="small-note">
          Want a closer look before visiting?{' '}
          <a
            className="text-link"
            href={site.facebook}
            target="_blank"
            rel="noreferrer"
          >
            Ask our team on Facebook{' '}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </p>
      </section>
      <ContactBand />
    </>
  );
}
