import { useEffect } from 'react';
import { useLocation } from 'react-router';
import type Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Ease wheel and touch scrolling on public pages. Nested panels retain native
// scrolling, and reduced-motion preferences disable the optional enhancement.
export function SmoothScroll() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/staff')) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let instance: Lenis | undefined;
    let active = true;
    let generation = 0;
    const syncLock = () => {
      if (!instance) return;
      const locked =
        document.hidden ||
        !!document.querySelector('[role="dialog"][data-state="open"]');
      if (locked && !instance.isStopped) instance.stop();
      else if (!locked && instance.isStopped) instance.start();
    };
    const sync = () => {
      const revision = ++generation;
      instance?.destroy();
      instance = undefined;
      if (reduced.matches) return;
      void import('lenis')
        .then(({ default: Scroll }) => {
          if (!active || revision !== generation) return;
          instance = new Scroll({
            autoRaf: true,
            lerp: 0.085,
            smoothWheel: true,
            syncTouch: true,
            syncTouchLerp: 0.085,
            touchInertiaExponent: 1.3,
            respectReducedMotion: true,
            stopInertiaOnNavigate: true,
            anchors: true,
            allowNestedScroll: true,
            prevent: (node) =>
              !!node.closest('[role="dialog"], [data-scroll-native]'),
          });
          syncLock();
        })
        .catch(() => {
          /* Native scrolling remains available if the optional chunk fails. */
        });
    };
    const focus = () =>
      instance?.scrollTo(window.scrollY, { immediate: true, force: true });
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked'],
    });
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', syncLock);
    document.addEventListener('focusin', focus);
    sync();
    return () => {
      active = false;
      generation++;
      instance?.destroy();
      observer.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', syncLock);
      document.removeEventListener('focusin', focus);
    };
  }, [pathname]);
  return null;
}
