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

  // ===== Contact: staggered element reveal =====
  const cRevealEls = document.querySelectorAll('.c-reveal');
  if (cRevealEls.length) {
    const cObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          cObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    cRevealEls.forEach((el) => cObserver.observe(el));
  }

  // ===== Contact: mouse parallax on orbs + ghost text =====
  const contactSection = document.querySelector('.contact');
  const ghostText      = document.querySelector('.contact__ghost');
  if (contactSection) {
    contactSection.addEventListener('mousemove', (e) => {
      const r  = contactSection.getBoundingClientRect();
      const cx = (e.clientX - r.left)  / r.width  - 0.5; // -0.5 → 0.5
      const cy = (e.clientY - r.top)   / r.height - 0.5;
      contactSection.style.setProperty('--cx', cx);
      contactSection.style.setProperty('--cy', cy);
      if (ghostText) {
        ghostText.style.transform =
          `translateY(calc(-50% + ${cy * -18}px)) translateX(${cx * -14}px)`;
      }
    });
    contactSection.addEventListener('mouseleave', () => {
      contactSection.style.setProperty('--cx', 0);
      contactSection.style.setProperty('--cy', 0);
      if (ghostText) ghostText.style.transform = 'translateY(-50%)';
    });
  }

  // ===== Contact: magnetic CTA button =====
  const ctaBtn = document.querySelector('.contact__cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', (e) => {
      const r  = ctaBtn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.32;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.32;
      ctaBtn.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
    });
    ctaBtn.addEventListener('mouseleave', () => {
      ctaBtn.style.transition = 'transform 0.5s var(--ease-smooth), box-shadow 0.3s';
      ctaBtn.style.transform  = '';
      setTimeout(() => { ctaBtn.style.transition = ''; }, 500);
    });
  }

  // ===== Shimmer on scroll + hover for headings =====
  const shimmerEls = document.querySelectorAll('.section-title, .contact__heading');

  function playShimmer(el) {
    el.classList.remove('shimmer-play');
    void el.offsetWidth; // force reflow so animation restarts
    el.classList.add('shimmer-play');
  }

  // Trigger once when element scrolls into view
  const shimmerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        playShimmer(entry.target);
        shimmerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  shimmerEls.forEach((el) => {
    shimmerObserver.observe(el);
    // Also replay on hover
    el.addEventListener('mouseenter', () => playShimmer(el));
  });

  // ===== Skills: continuous loop, pause on hover =====
  const skillsRunner = document.querySelector('.skills-runner');
  const skillsTrack  = document.querySelector('.skills-track');
  if (skillsRunner && skillsTrack) {
    document.fonts.ready.then(() => {
      const originalW = skillsTrack.scrollWidth;

      // Clone items until track is > 3x viewport wide — guarantees no visible gap
      while (skillsTrack.scrollWidth < window.innerWidth * 3) {
        Array.from(skillsTrack.children).forEach((child) => {
          const clone = child.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          skillsTrack.appendChild(clone);
        });
      }

      let pos    = 0;
      let paused = false;
      const SPEED = 0.55;

      skillsRunner.addEventListener('mouseenter', () => { paused = true; });
      skillsRunner.addEventListener('mouseleave', () => { paused = false; });

      const tick = () => {
        if (!paused) {
          pos -= SPEED;
          if (pos <= -originalW) pos += originalW;
          skillsTrack.style.transform = `translateX(${pos}px)`;
        }
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }

  // ===== Animated Background Particles =====
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const ACCENT   = '212, 168, 83';  // matches --accent
  const ACCENT2  = '180, 140, 220'; // soft purple complement
  const COUNT    = window.innerWidth < 768 ? 180 : 320;
  const CONNECT  = 130;             // max connection distance (px)
  const REPEL    = 130;             // mouse repel radius (px)
  const MAX_SPD  = 5;               // max particle speed after repel
  const SPRING   = 0.015;           // how strongly particles return to origin
  const DAMP     = 0.95;            // velocity damping (higher = slower return)
  let particles  = [];
  let mouse      = { x: -9999, y: -9999 };
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function mkParticle() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const gold = Math.random() > 0.35;
    return {
      x, y,
      vx: 0, vy: 0,
      // Home position: drifts slowly so particles still wander gently
      ox: x, oy: y,
      ovx: (Math.random() - 0.5) * 0.22,
      ovy: (Math.random() - 0.5) * 0.22,
      r:  Math.random() * 1.4 + 0.4,
      color: gold ? ACCENT : ACCENT2,
    };
  }

  function init() {
    particles = Array.from({ length: COUNT }, mkParticle);
  }

  function update() {
    particles.forEach((p) => {
      // 1. Drift the home position slowly
      p.ox += p.ovx;
      p.oy += p.ovy;
      if (p.ox < 0 || p.ox > canvas.width)  p.ovx *= -1;
      if (p.oy < 0 || p.oy > canvas.height) p.ovy *= -1;

      // 2. Mouse repel — shoot particles away from cursor
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.hypot(dx, dy);
      if (d < REPEL && d > 0) {
        const f = ((REPEL - d) / REPEL) * 3.2;
        p.vx += (dx / d) * f * 0.4;
        p.vy += (dy / d) * f * 0.4;
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > MAX_SPD) { p.vx = (p.vx / spd) * MAX_SPD; p.vy = (p.vy / spd) * MAX_SPD; }
      }

      // 3. Spring: pull back toward home position
      p.vx += (p.ox - p.x) * SPRING;
      p.vy += (p.oy - p.y) * SPRING;

      // 4. Damp and move
      p.vx *= DAMP;
      p.vy *= DAMP;
      p.x  += p.vx;
      p.y  += p.vy;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT) {
          const alpha = (1 - dist / CONNECT) * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${particles[i].color}, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, 0.55)`;
      ctx.fill();
    });
  }

  function loop() {
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  // Track mouse position for repel effect
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    init();
    loop();
  });

  // Start after loader finishes so it fades in cleanly
  resize();
  init();
  loop();
  // Fade canvas in once loader is done (loader takes ~1.8s + 0.4s delay)
  setTimeout(() => canvas.classList.add('visible'), 2400);
})();
