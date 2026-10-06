// The site's only script, loaded with defer. Everything works without it:
// a <noscript> style opens the app navigation, and the carousel scrolls by touch
// or trackpad.
(() => {
  // App header: the hamburger toggle below 768px (ported from Karacho's Header.astro).
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    const target = document.getElementById(toggle.getAttribute('aria-controls'));
    if (target) {
      const set = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        target.toggleAttribute('data-open', open);
      };
      toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
      // A section link scrolls the page; the open menu would cover the section.
      target.addEventListener('click', (event) => {
        if (event.target.closest('a')) set(false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          set(false);
          toggle.focus();
        }
      });
    }
  }

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
