import { Link } from 'react-router';
import { ArrowUpRight, ArrowRight, CircleHelp } from 'lucide-react';
import type { ReactNode } from 'react';
import { faqs, site } from '@/content/site';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export function TextLink({
  to,
  children,
  className = '',
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link className={`text-link ${className}`} to={to}>
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}
export function PageHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="page-heading wrap">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{label}</span>
      </nav>
      <h1>{title}</h1>
      <p className="lead">{children}</p>
    </section>
  );
}
export function Notice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="notice">
      <CircleHelp size={21} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}
export function FaqList({ limit }: { limit?: number }) {
  return (
    <Accordion type="single" collapsible className="faq-list">
      {faqs.slice(0, limit).map((faq, n) => (
        <AccordionItem key={faq.question} value={`faq-${n}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>
            <p>{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
export function ContactBand() {
  return (
    <section className="contact-band">
      <div className="wrap">
        <div>
          <p className="section-label">Make a little time for play.</p>
          <h2>See you at Jomeca.</h2>
        </div>
        <a className="pill-button light" href={site.phoneHref}>
          Let’s talk <ArrowRight size={19} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
