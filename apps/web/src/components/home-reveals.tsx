import { useEffect, useRef, type ReactNode } from 'react';

export function HomeReveals({
  children,
  className = 'home-reference',
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !root.current ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          entry.target.classList.toggle('home-entered', entry.isIntersecting);
      },
      { threshold: 0.08 },
    );
    root.current
      .querySelectorAll('[data-home-reveal]')
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
