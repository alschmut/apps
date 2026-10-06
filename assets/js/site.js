// The site's only script, loaded with defer. Everything works without it: the
// carousel scrolls by touch or trackpad.
(() => {
  // Screenshot carousel arrows (ported from Karacho's Screenshots.astro).
  const scroller = document.querySelector('.screenshots-scroll');
  if (scroller) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // One card plus the 1.5rem (24px) gap between two cards.
    const step = () => (scroller.querySelector('.screenshot-card')?.offsetWidth ?? 0) + 24;
    const scroll = (direction) =>
      scroller.scrollBy({ left: direction * step(), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    document.querySelector('.carousel-prev')?.addEventListener('click', () => scroll(-1));
    document.querySelector('.carousel-next')?.addEventListener('click', () => scroll(1));
  }
})();
