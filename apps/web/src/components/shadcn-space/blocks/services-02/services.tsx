// Adapted interaction/composition from the supplied Shadcn Space services-02.
// See THIRD_PARTY_NOTICES.md. Content, schematic art and styling are Jomeca-specific.
import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { facilities, type Sport } from '@/content/site';
import { CourtArt } from '@/components/court-art';
import { TextLink } from '@/components/public-ui';
import { StockPhoto } from '@/components/stock-photo';

export function CourtShowcase({ stock = false }: { stock?: boolean }) {
  const [selected, setSelected] = useState<Sport>('pickleball');
  const active = facilities.find((item) => item.id === selected)!;
  return (
    <section className="section wrap">
      <div className="section-heading">
        <div>
          <p className="section-label">Find your kind of play</p>
          <h2>
            Good games.
            <br />
            Great company.
          </h2>
        </div>
        <TextLink to="/facilities">Explore all courts</TextLink>
      </div>
      <div className="court-showcase">
        <figure className={`showcase-art art-${selected}`}>
          {stock ? (
            <StockPhoto key={selected} kind={selected} />
          ) : (
            <CourtArt sport={selected} />
          )}
          <span className="art-number">0{active.count}</span>
          <span className="art-label">
            {active.count === 1 ? 'court' : 'courts'} to make it your game
          </span>
        </figure>
        <div className="sport-selector">
          {facilities.map((item, n) => (
            <div
              key={item.id}
              className={`sport-option ${selected === item.id ? 'is-selected' : ''}`}
            >
              <h3>
                <button
                  aria-expanded={selected === item.id}
                  aria-controls={`sport-${item.id}`}
                  onClick={() => setSelected(item.id)}
                >
                  <span className="sport-index">0{n + 1}</span>
                  {item.name}
                  {selected === item.id ? (
                    <Minus size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </button>
              </h3>
              <div id={`sport-${item.id}`} hidden={selected !== item.id}>
                <p>{item.description}</p>
                <div className="sport-foot">
                  <span>
                    {item.count} {item.count === 1 ? 'court' : 'courts'} · Rates
                    to be announced
                  </span>
                  <Link
                    to={
                      item.id === 'basketball'
                        ? '/gymnasium'
                        : `/reservations?court=${item.id}-1`
                    }
                    aria-label={`Explore ${item.name} reservations`}
                    className="circle-link"
                  >
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
