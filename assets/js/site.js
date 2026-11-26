// The site's only script, loaded with defer. Everything works without it: the
// carousel scrolls by touch or trackpad, and the language menus open and work as links.
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

  // Language menus (<details class="lang-menu">): they open without JS; this closes an open one on a
  // click outside it or on Escape, and remembers the chosen language for the old paths without a
  // language, such as /impressum/ (see engine/layouts/redirect.html).
  const menus = [...document.querySelectorAll('.lang-menu')];
  if (menus.length > 0) {
    document.addEventListener('click', (event) => {
      for (const menu of menus) {
        if (menu.open && !menu.contains(event.target)) menu.open = false;
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      for (const menu of menus) {
        if (!menu.open) continue;
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    });
    for (const link of document.querySelectorAll('.lang-menu-item[data-lang]')) {
      link.addEventListener('click', () => {
        try {
          localStorage.setItem('lang', link.dataset.lang);
        } catch {
          // Storage can be blocked; the link still works.
        }
      });
    }
  }
})();
