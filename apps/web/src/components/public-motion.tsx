import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Content remains visible without JavaScript or motion support. Booking controls
// and staff screens are excluded so animation never moves an active input.
export function PublicMotion() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/staff')) return;
    const root = document.getElementById('main');
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visualSelector =
      '.facilities-hero-photos img, .facility-card-art > img, .facilities-event-photo > img, .event-editorial-photo > img, .editorial-hero-photo > img, .about-art';
    const visuals = new Set<HTMLElement>();
    const collect = (element: HTMLElement) => {
      visuals.add(element);
      element.classList.add('scroll-trail-visual');
    };
    root.querySelectorAll<HTMLElement>(visualSelector).forEach(collect);
    const visualChanges = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(visualSelector)) collect(node);
          node.querySelectorAll<HTMLElement>(visualSelector).forEach(collect);
        }
      for (const element of visuals)
        if (!element.isConnected) {
          element.classList.remove('scroll-trail-visual');
          element.style.removeProperty('--scroll-trail');
          visuals.delete(element);
        }
    });
    visualChanges.observe(root, { childList: true, subtree: true });
    let frame = 0;
    let following = window.scrollY;
    let previousTime = 0;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      following = window.scrollY;
      previousTime = 0;
      visuals.forEach((element) =>
        element.style.removeProperty('--scroll-trail'),
      );
    };
    const tick = (now: number) => {
      const elapsed = previousTime ? Math.min(64, now - previousTime) : 16;
      previousTime = now;
      const distance = window.scrollY - following;
      following += distance * (1 - Math.exp(-elapsed / 110));
      const offset = Math.max(
        -8,
        Math.min(8, (window.scrollY - following) * 0.08),
      );
      visuals.forEach((element) =>
        element.style.setProperty('--scroll-trail', `${offset.toFixed(2)}px`),
      );
      frame =
        Math.abs(window.scrollY - following) > 0.1
          ? window.requestAnimationFrame(tick)
          : 0;
      if (!frame) reset();
    };
    const scroll = () => {
      if (!preference.matches && !document.hidden && !frame) {
        previousTime = 0;
        frame = window.requestAnimationFrame(tick);
      }
    };
    const change = () => {
      if (preference.matches || document.hidden) reset();
    };
    window.addEventListener('scroll', scroll, { passive: true });
    preference.addEventListener('change', change);
    document.addEventListener('visibilitychange', change);
    return () => {
      reset();
      visualChanges.disconnect();
      visuals.forEach((element) =>
        element.classList.remove('scroll-trail-visual'),
      );
      window.removeEventListener('scroll', scroll);
      preference.removeEventListener('change', change);
      document.removeEventListener('visibilitychange', change);
    };
  }, [pathname]);
  useEffect(() => {
    if (pathname.startsWith('/staff') || !('IntersectionObserver' in window))
      return;
    const root = document.getElementById('main');
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Map<Element, Animation>();
    const watched = new WeakSet<Element>();
    const selector =
      'h1, h2, h3, .lead, .editorial-lead, .section-label, section > p:not(.field-hint):not(.small-note), section > div > p:not(.field-hint):not(.small-note), .about-art, .values-grid > article, .offer-grid > article, .contact-info > div, .location-card, .gallery-grid > *, .full-event-rules dl > div';
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || preference.matches) continue;
          const element = entry.target;
          animations.get(element)?.cancel();
          const visual = element.matches(
            '.about-art, .location-card, .gallery-grid > *',
          );
          const animation = element.animate(
            [
              {
                opacity: 0.35,
                transform: visual
                  ? 'translateY(22px) scale(.98)'
                  : 'translateY(18px)',
              },
              { opacity: 1, transform: 'translateY(0) scale(1)' },
            ],
            {
              duration: visual ? 750 : 600,
              easing: 'cubic-bezier(.16,1,.3,1)',
            },
          );
          animations.set(element, animation);
        }
      },
      { threshold: 0.12, rootMargin: '-100px 0px -25px 0px' },
    );
    const observe = (element: Element) => {
      if (
        watched.has(element) ||
        element.parentElement?.closest(selector) ||
        element.closest(
          'form, .planning-grid, .sports-planner, [role="dialog"], [role="alert"]',
        ) ||
        element.querySelector('.motion-word')
      )
        return;
      watched.add(element);
      intersection.observe(element);
    };
    root.querySelectorAll(selector).forEach(observe);
    const mutations = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(selector)) observe(node);
          node.querySelectorAll(selector).forEach(observe);
        }
    });
    mutations.observe(root, { childList: true, subtree: true });
    const stop = () => {
      if (preference.matches)
        for (const animation of animations.values()) animation.cancel();
    };
    preference.addEventListener('change', stop);
    return () => {
      mutations.disconnect();
      intersection.disconnect();
      preference.removeEventListener('change', stop);
      for (const animation of animations.values()) animation.cancel();
    };
  }, [pathname]);
  return null;
}
