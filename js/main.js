(() => {
  'use strict';

  // ===== Loader =====
  const counter = document.getElementById('loaderCounter');
  const progress = document.getElementById('loaderProgress');
  const loader = document.getElementById('loader');
  const header = document.getElementById('header');

  let count = 0;
  const target = 100;
  const duration = 1800; // ms
  const interval = duration / target;

  const tick = () => {
    if (count >= target) {
      counter.textContent = target;
      progress.style.width = '100%';

      setTimeout(() => {
        loader.classList.add('done');
        header.classList.add('visible');
        revealHeroElements();
      }, 400);
      return;
    }

    count += 1;
    counter.textContent = count;
    progress.style.width = count + '%';
    setTimeout(tick, interval + Math.random() * 10);
  };

  tick();

  // ===== Reveal hero elements after loader =====
  function revealHeroElements() {
    const heroReveals = document.querySelectorAll('.hero .reveal');
    heroReveals.forEach((el) => {
      el.classList.add('visible');
    });
  }

  // ===== Scroll Reveal (IntersectionObserver) =====
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all .reveal elements outside the hero (hero handled separately)
  document.querySelectorAll('.reveal').forEach((el) => {
    if (!el.closest('.hero')) {
      revealObserver.observe(el);
    }
  });

  // ===== Smooth anchor scrolling =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Pause marquee on hover =====
  const marqueeTrack = document.querySelector('.marquee__track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }
})();
