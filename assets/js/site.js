// The site's only script, loaded with defer. Everything works without it:
// a <noscript> style opens the app navigation, the carousel scrolls by touch or
// trackpad, and a screenshot link opens the full image.
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

  // Lightbox (ported from Karacho's Lightbox.astro). Esc closes the native <dialog>.
  const dialog = document.querySelector('dialog.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const caption = dialog.querySelector('.lightbox-caption');
    const image = dialog.querySelector('.lightbox-image');

    for (const trigger of document.querySelectorAll('.screenshot-trigger')) {
      trigger.addEventListener('click', (event) => {
        // Let modified clicks (new tab, new window) open the image as a plain link.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        const { full, caption: text } = trigger.dataset;
        // Clear first, so that the previous screenshot is not shown while the next one loads.
        image.removeAttribute('src');
        image.src = full || trigger.href;
        image.alt = trigger.querySelector('img')?.alt ?? '';
        caption.textContent = text ?? '';
        dialog.showModal();
      });
    }

    dialog.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
    // The content fills the dialog, so a click that lands on the dialog itself hit the backdrop.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }
})();
