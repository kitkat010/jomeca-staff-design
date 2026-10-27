import { Suspense, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import {
  ArrowUpRight,
  MapPin,
  Menu,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { site, navigation, pageMeta } from '@/content/site';
import { BrandLogo } from '@/components/brand-logo';
import { PublicMotion } from '@/components/public-motion';
import { SmoothScroll } from '@/components/smooth-scroll';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

function MoreNavigation() {
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        root.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return (
    <details
      className="nav-more"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          root.current?.removeAttribute('open');
          root.current?.querySelector('summary')?.focus();
        }
      }}
    >
      <summary>
        More <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <div className="nav-more-links">
        {navigation
          .filter((item) =>
            ['/about', '/gallery', '/memberships', '/events', '/faqs'].includes(
              item.to,
            ),
          )
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => root.current?.removeAttribute('open')}
            >
              {item.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </NavLink>
          ))}
        <NavLink
          to="/reservation-status"
          onClick={() => root.current?.removeAttribute('open')}
        >
          Reservation status
          <ArrowUpRight size={14} aria-hidden="true" />
        </NavLink>
      </div>
    </details>
  );
}

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const meta = pageMeta[pathname] ?? {
      title: 'Page not found',
      description: 'Find your way back to Jomeca Center.',
    };
    document.title = `${meta.title} | Jomeca Center`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', meta.description);
    const main = document.getElementById('main');
    main?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <RouteEffects />
      <PublicMotion />
      <SmoothScroll />
      <svg
        className="brand-filter-definitions"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="brand-remove-white" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 0 2.85"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap nav-row">
          <Link to="/" className="wordmark" aria-label="Jomeca Center home">
            <BrandLogo />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {[
              { to: '/', label: 'Home' },
              { to: '/facilities', label: 'Courts & rates' },
              { to: '/reservations', label: 'Reservations' },
              { to: '/contact', label: 'Contact' },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
            <MoreNavigation />
          </nav>
          <div className="nav-actions">
            <Link to="/reservations" className="pill-button nav-cta">
              Find your game <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Dialog>
              <DialogTrigger
                className="menu-toggle"
                aria-label="Open navigation menu"
              >
                <Menu size={24} />
              </DialogTrigger>
              <DialogContent className="nav-dialog">
                <DialogTitle className="dialog-heading">
                  Explore Jomeca
                </DialogTitle>
                <DialogDescription className="muted">
                  A little play. A lot to discover.
                </DialogDescription>
                <nav aria-label="Mobile navigation">
                  {navigation.map((item) => (
                    <DialogClose key={item.to} asChild>
                      <NavLink to={item.to}>
                        {item.label}
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </NavLink>
                    </DialogClose>
                  ))}
                  <DialogClose asChild>
                    <NavLink to="/reservation-status">
                      Reservation status
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </NavLink>
                  </DialogClose>
                </nav>
                <DialogClose asChild>
                  <Link className="staff-link" to="/staff">
                    Staff sign in
                  </Link>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className={pathname.startsWith('/staff') ? undefined : 'public-surface'}
      >
        <Suspense
          fallback={
            <section className="wrap page-section" role="status">
              Loading page…
            </section>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-top">
            <div>
              <Link
                to="/"
                className="footer-brand"
                aria-label="Jomeca Center home"
              >
                <BrandLogo />
              </Link>
              <p>Where Memories Play.</p>
              <p className="footer-address">
                <MapPin size={17} aria-hidden="true" />
                {site.address}
              </p>
            </div>
            <div className="footer-links">
              <div>
                <h2>Come play</h2>
                {navigation
                  .filter((_, n) => [1, 2, 3, 5].includes(n))
                  .map((item) => (
                    <Link key={item.to} to={item.to}>
                      {item.label}
                    </Link>
                  ))}
              </div>
              <div>
                <h2>Stay connected</h2>
                {navigation
                  .filter((_, n) => [4, 6, 7, 8, 9].includes(n))
                  .map((item) => (
                    <Link key={item.to} to={item.to}>
                      {item.label}
                    </Link>
                  ))}
              </div>
              <div>
                <h2>Say hello</h2>
                <a href={site.phoneHref}>{site.phone}</a>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <a href={site.facebook} target="_blank" rel="noreferrer">
                  Facebook <ArrowUpRight size={14} aria-hidden="true" />
                </a>
                <span>
                  {site.days} · {site.hours}
                </span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Jomeca Center</span>
            <span>
              Mapandan, Pangasinan <ArrowRight size={14} aria-hidden="true" /> A
              place to belong.
            </span>
            <Link to="/staff">Staff sign in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
