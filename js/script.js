
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== NAVBAR: estado loaded + scrolled ===== */
  window.addEventListener('DOMContentLoaded', () => {
    $('#mainNav')?.classList.add('loaded');
  });
  window.addEventListener('scroll', () => {
    const nav = $('#mainNav');
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ===== NAV LINK ACTIVO por URL ===== */
  (() => {
    const filename = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a[href]').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === filename);
    });
  })();

  /* ===== PAGE TRANSITION: salida animada ===== */
  if (!prefersReduced) {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      const current = location.pathname.split('/').pop() || 'index.html';
      if (!href || !href.endsWith('.html') || link.getAttribute('target') === '_blank' || link.hasAttribute('download') || href === current) return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  }

  /* ===== NAVBAR: menú móvil ===== */
  (() => {
    const nav  = document.getElementById('mainNav');
    const btn  = nav?.querySelector('.nav-toggle');
    const list = nav?.querySelector('#navMenu');
    const backdrop = nav?.querySelector('.nav-backdrop');
    if (!nav || !btn || !list || !backdrop) return;

    const open = () => {
      nav.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      backdrop.hidden = false;
      document.body.classList.add('nav-open');
      list.querySelector('a[href], button:not([disabled])')?.focus();
    };

    const close = () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      backdrop.hidden = true;
      document.body.classList.remove('nav-open');
      btn.focus({ preventScroll: true });
    };

    btn.addEventListener('click', () => {
      btn.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    backdrop.addEventListener('click', close);
    list.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { e.preventDefault(); close(); }
    });
    const mql = matchMedia('(max-width: 900px)');
    mql.addEventListener?.('change', () => { if (!mql.matches) close(); });
  })();

  /* ===== COPIAR EMAIL (about + cv) ===== */
  (() => {
    const copyers = [
      { btn: $('#copyEmail'), text: $('#emailText')?.textContent?.trim() },
      { btn: $('#cvCopy'),   text: $('#cvEmail')?.textContent?.trim() }
    ];
    copyers.forEach(({ btn, text }) => {
      if (!btn || !text) return;
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copiado ✓';
        } catch {
          btn.textContent = 'No se pudo copiar';
        }
        setTimeout(() => (btn.textContent = 'Copiar email'), 1400);
      });
    });
  })();

  /* ===== HERO: reveal + parallax ===== */
  (() => {
    const hero = $('#hero');
    const card = $('.hero-card');
    if (!hero || !card) return;

    let d = 0;
    $$('.hero-card [data-animate]').forEach(el => {
      if (!el.dataset.delay) el.dataset.delay = (0.10 + d * 0.08).toFixed(2);
      d++;
    });

    const heroIO = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          card.classList.add('revealed');
          hero.classList.add('revealed');
          heroIO.disconnect(); // reveal de una sola vez; evita revertir al hacer scroll
        }
      });
    }, { threshold: 0.25 });
    heroIO.observe(hero);

    const blobs = $$('.hero-blob', hero);
    const resetParallax = () => {
      card.style.transform = '';
      blobs.forEach(b => b.style.transform = '');
    };
    // Resetear si hay contacto táctil (evita que quede en posición incorrecta)
    hero.addEventListener('touchstart', resetParallax, { passive: true });

    if (!prefersReduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let raf = 0;
      hero.addEventListener('mousemove', (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const rx = (e.clientX - r.left) / r.width - .5;
          const ry = (e.clientY - r.top) / r.height - .5;
          card.style.transform = `translate3d(${rx * 10}px, ${ry * 10}px, 0)`;
          if (blobs[0]) blobs[0].style.transform = `translate(${rx * -40}px, ${ry * 24}px)`;
          if (blobs[1]) blobs[1].style.transform = `translate(${rx * 30}px, ${ry * -20}px)`;
        });
      });
      hero.addEventListener('mouseleave', resetParallax);
    }
  })();

  /* ===== REVEAL GENÉRICO (.reveal) ===== */
  (() => {
    const reveal = (root, nodes, once) => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          const delay = parseFloat(target.dataset.delay || 0);
          if (isIntersecting) {
            target.style.transitionDelay = delay ? `${delay}s` : '';
            target.classList.add('in');
            if (once) io.unobserve(target);
          } else {
            if (once && target.classList.contains('in')) return;
            target.classList.remove('in');
            target.style.transitionDelay = '';
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px', root });
      nodes.forEach(n => io.observe(n));
    };

    /* Elementos fuera del CV: observer normal con viewport */
    const outsideCV = $$('.reveal').filter(n => !n.closest('.js-reveal-once'));
    reveal(null, outsideCV, false);

    /* Elementos dentro del CV: separar los que están dentro/fuera del scroll container */
    const resumeWrap = document.querySelector('.resume-wrap');
    const insideCV   = $$('.js-reveal-once .reveal');
    if (insideCV.length) {
      const inWrap  = insideCV.filter(n => !!n.closest('.resume-wrap'));
      const outWrap = insideCV.filter(n => !n.closest('.resume-wrap'));
      if (outWrap.length) reveal(null, outWrap, true);
      if (resumeWrap && inWrap.length) reveal(resumeWrap, inWrap, true);
    }
  })();

  /* ===== SKILLS ===== */
  (() => {
    const play = (card) => {
      const level = Math.max(0, Math.min(100, Number(card.dataset.level || 0)));
      const fill = card.querySelector('.fill');
      const num  = card.querySelector('.skill-num');
      const meter = card.querySelector('.meter');
      if (!fill || !num || !meter) return;
      meter.setAttribute('aria-valuenow', String(level));
      requestAnimationFrame(() => { fill.style.width = level + '%'; });
      let start = 0;
      const step = (ts) => {
        if (!card.classList.contains('in')) return;
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / 900);
        num.textContent = Math.round(p * level) + '%';
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const reset = (card) => {
      const fill = card.querySelector('.fill');
      const num  = card.querySelector('.skill-num');
      if (fill) fill.style.width = '0%';
      if (num)  num.textContent = '0%';
      card.querySelector('.meter')?.setAttribute('aria-valuenow', '0');
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        const delay = parseFloat(target.dataset.delay || 0);
        if (isIntersecting) {
          target.style.transitionDelay = delay ? `${delay}s` : '';
          target.classList.add('in');
          setTimeout(() => target.classList.contains('in') && play(target), delay * 1000 + 40);
        } else {
          target.classList.remove('in');
          target.style.transitionDelay = '';
          reset(target);
        }
      });
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
    $$('#skills .skill').forEach(el => io.observe(el));
  })();

  /* ===== CERTIFICATIONS: filtros + lightbox ===== */
  (() => {
    const tabs  = $$('#certifications .tab');
    const cards = $$('#certifications .c-card');
    if (!tabs.length && !cards.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        const delay = parseFloat(target.dataset.delay || 0);
        if (isIntersecting) {
          target.style.transitionDelay = delay ? `${delay}s` : '';
          target.classList.add('in');
        } else {
          target.classList.remove('in');
          target.style.transitionDelay = '';
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    cards.forEach(c => io.observe(c));

    const apply = (cat) => {
      cards.forEach(card => {
        const match = cat === 'all' || (card.dataset.cat || '').split(',').includes(cat);
        card.classList.toggle('hidden', !match);
      });
    };
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.setAttribute('aria-selected', 'false'));
        t.setAttribute('aria-selected', 'true');
        apply(t.dataset.filter);
      });
    });

    let lb = document.querySelector('.lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <button class="lightbox__close" type="button" aria-label="Cerrar">✕</button>
        <img class="lightbox__img" alt="">
      `;
      document.body.appendChild(lb);
    }
    const lbImg   = lb.querySelector('.lightbox__img');
    const lbClose = lb.querySelector('.lightbox__close');

    function openLightbox(src, title, issuer, clickX, clickY) {
      lbImg.src = src;
      lbImg.alt = `${title || 'Certificado'}${issuer ? ' — ' + issuer : ''}`;
      const vw = window.innerWidth, vh = window.innerHeight;
      lb.style.setProperty('--x', (clickX / vw * 100).toFixed(2) + '%');
      lb.style.setProperty('--y', (clickY / vh * 100).toFixed(2) + '%');
      lb.classList.add('open');
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); }, { once: true });
    }
    function closeLightbox() {
      lb.classList.remove('open');
      document.body.classList.remove('modal-open');
      lbImg.src = '';
    }
    lb.addEventListener('click', e => {
      if (e.target === lb || e.target === lbClose) closeLightbox();
    });

    $$('#certifications .btn-mini').forEach(btn => {
      btn.addEventListener('click', ev => {
        const src = btn.dataset.view;
        if (!src) return;
        openLightbox(src, btn.dataset.title || 'Certificado', btn.dataset.issuer || '', ev.clientX, ev.clientY);
      });
    });
  })();

  /* ===== SERVICES: reveal sección + tarjetas ===== */
  (() => {
    const section = document.getElementById('services');
    const cards = $$('#services .service-card');
    if (!section || !cards.length) return;

    const revealNextFrame = (el, cls = 'in') => {
      if (el.__revealedOnce) { el.classList.add(cls); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add(cls);
        el.__revealedOnce = true;
      }));
    };

    new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) revealNextFrame(section, 'in');
        else section.classList.remove('in');
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }).observe(section);

    const cardIO = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        const delay = parseFloat(target.dataset.delay || 0);
        if (isIntersecting) {
          target.style.transitionDelay = delay ? `${delay}s` : '';
          revealNextFrame(target, 'in');
        } else {
          target.classList.remove('in');
          target.style.transitionDelay = '';
        }
      });
    }, { threshold: 0.15, rootMargin: '-10% 0px -10% 0px' });
    cards.forEach(c => cardIO.observe(c));
  })();

})();

/* ===== CONTACTO: copiar email/teléfono ===== */
(() => {
  document.querySelectorAll('.contact-card [data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const el = document.querySelector(btn.getAttribute('data-copy'));
      const txt = el?.textContent?.trim() || '';
      if (!txt) return;
      try {
        await navigator.clipboard.writeText(txt);
        const prev = btn.textContent;
        btn.textContent = 'Copiado ✓';
        setTimeout(() => btn.textContent = prev, 1400);
      } catch { /* noop */ }
    });
  });
})();

/* ===== CONTACT: reveal contenedor ===== */
(() => {
  const section = document.getElementById('contact');
  if (!section) return;
  new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting }) => {
      section.classList.toggle('in', isIntersecting);
    });
  }, { threshold: .18, rootMargin: '0px 0px -8% 0px' }).observe(section);
})();

/* ===== REFERENCIAS: copiar ===== */
(() => {
  document.querySelectorAll('.ref-copy-btn[data-ref-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.refCopy;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = '✓ Copiado';
        setTimeout(() => (btn.textContent = prev), 1400);
      } catch { /* noop */ }
    });
  });
})();
