import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowDown } from 'lucide-react';
import { StockPhoto } from '@/components/stock-photo';
import type { StockMediaKey } from '@/content/media';

export function EditorialHero({
  label,
  title,
  children,
  kind,
  anchor,
  action = 'Explore more',
}: {
  label: string;
  title: string;
  children: ReactNode;
  kind: StockMediaKey;
  anchor: string;
  action?: string;
}) {
  return (
    <section className="editorial-hero wrap" aria-labelledby="editorial-title">
      <div className="editorial-hero-copy">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label}</span>
        </nav>
        <p className="section-label">Where Memories Play.</p>
        <h1 id="editorial-title">{title}</h1>
        <p className="editorial-lead">{children}</p>
        <a href={anchor} className="pill-button light">
          {action}
          <ArrowDown size={17} aria-hidden="true" />
        </a>
      </div>
      <figure className="editorial-hero-photo">
        <StockPhoto kind={kind} priority />
      </figure>
    </section>
  );
}
