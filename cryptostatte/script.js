(function () {
  'use strict';

  const header = document.querySelector('.header');
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      mobileMenu.hidden = !isOpen;
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileMenu.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealElements = document.querySelectorAll(
    '.feature-card, .step, .cta__inner, .section-header'
  );
  revealElements.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));

  const counter = document.querySelector('[data-count]');
  if (counter) {
    const target = parseInt(counter.dataset.count, 10);
    const duration = 2000;
    let started = false;

    const countObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          countObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    countObserver.observe(counter);
  }
})();
