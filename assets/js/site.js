// The site's only script, loaded with defer. Everything works without it: the
// carousel scrolls by touch or trackpad.
(() => {
  // Screenshot carousel arrows (ported from Karacho's Screenshots.astro).
  // With an iPhone / iPad picker there is one row per device; the arrows scroll the visible one.
  const scrollers = [...document.querySelectorAll('.screenshots-scroll')];
  if (scrollers.length > 0) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibleScroller = () => scrollers.find((scroller) => scroller.offsetParent !== null);
    // One card plus the 1.5rem (24px) gap between two cards.
    const step = (scroller) => (scroller.querySelector('.screenshot-card')?.offsetWidth ?? 0) + 24;
    const scroll = (direction) => {
      const scroller = visibleScroller();
      scroller?.scrollBy({ left: direction * step(scroller), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    };
    document.querySelector('.carousel-prev')?.addEventListener('click', () => scroll(-1));
    document.querySelector('.carousel-next')?.addEventListener('click', () => scroll(1));
  }
})();
