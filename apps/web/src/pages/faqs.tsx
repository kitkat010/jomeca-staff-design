import { EditorialHero } from '@/components/editorial-hero';
import { useEffect, useState } from 'react';
import type { BookingCatalog } from '@jomeca/shared';
import { api } from '@/lib/api';
import { eventGuidance } from '@/content/event-rules';
import { FaqList, Notice, ContactBand } from '@/components/public-ui';

export function FaqPage() {
  const [catalog, setCatalog] = useState<BookingCatalog | null>(null);
  useEffect(() => {
    let active = true;
    api<BookingCatalog>('/booking/catalog')
      .then((value) => {
        if (active) setCatalog(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const eventRule = catalog?.rules.find((rule) => rule.kind === 'events');
  return (
    <>
      <EditorialHero
        label="FAQs & policies"
        title="A few things before we play."
        kind="badminton"
        anchor="#questions"
        action="Read the guidance"
      >
        Hours, facilities, and what to expect from the planned reservation
        process—all in one place.
      </EditorialHero>
      <section className="wrap page-section faq-page" id="questions">
        <section
          className="full-event-rules"
          aria-labelledby="full-event-rules-title"
        >
          <p className="section-label">Event planning</p>
          <h2 id="full-event-rules-title">Before your occasion.</h2>
          <p>
            Current scheduling guidance for the shared gymnasium venue. Opening
            hours and date-specific closures are shown in the event planner.
          </p>
          <dl>
            {eventGuidance(eventRule).map((item) => (
              <div key={item.title}>
                <dt>{item.title}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
          <Notice title="Details still being finalized">
            <p>
              Event prices, packages, approved capacity, equipment availability
              and setup/teardown allowances need staff confirmation.
              Cancellation and rescheduling drafts below are not final booking
              terms.
            </p>
          </Notice>
        </section>
        <FaqList />
        <div className="policy-section">
          <p className="section-label">Policies & facility rules</p>
          <h2>
            Clear expectations.
            <br />
            Better experiences.
          </h2>
          <Notice title="Draft policies — not final booking terms">
            <p>
              The cancellation and rescheduling guidelines below are drafts for
              management review. Final approved terms, waiver, privacy notice,
              and facility rules will be published before online booking opens.
              Policy acceptance is available when online booking opens.
            </p>
          </Notice>
          <details className="policy-draft">
            <summary>Sports cancellation & rescheduling draft</summary>
            <p>
              The initial draft proposes non-refundable confirmed sports
              bookings, with one reschedule requested at least 24 hours before
              the session, subject to availability. Later requests and no-shows
              would ordinarily be ineligible. This is not an approved policy.
            </p>
          </details>
          <details className="policy-draft">
            <summary>Event cancellation & rescheduling draft</summary>
            <p>
              The initial draft proposes non-refundable event deposits and
              rescheduling requests at least 14 days before the event, subject
              to management approval and venue availability. Extra costs may
              apply. Deposit amounts and final terms remain undecided.
            </p>
          </details>
          <details className="policy-draft">
            <summary>Facility-initiated cancellation draft</summary>
            <p>
              The draft proposes a full refund or an alternative schedule if
              Jomeca cancels a confirmed reservation or the facility becomes
              unavailable. Final handling and approved terms will be published
              before launch.
            </p>
          </details>
          <details className="policy-draft">
            <summary>Waiver, privacy notice & facility rules</summary>
            <p>
              These documents are being prepared for review. If you contact us
              through your own email or phone, our team will receive the details
              you choose to share. Please avoid sending payment screenshots or
              sensitive personal information before receiving staff
              instructions.
            </p>
          </details>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
