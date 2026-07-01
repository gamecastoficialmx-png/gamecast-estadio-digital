/* =========================================
   Game Cast Estadio Digital — main.js
   ========================================= */

/* =============================================
   HAMBURGER MENU
   ============================================= */
(function () {
  const btn  = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-nav');
  if (!btn || !menu) return;

  function close() {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', function () {
    const isOpen = btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.classList.toggle('open', isOpen);
    menu.setAttribute('aria-hidden', String(!isOpen));
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();

/* =============================================
   SCROLL PROGRESS BAR
   ============================================= */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* =============================================
   FLOATING CTA + BACK TO TOP
   ============================================= */
(function () {
  const floatCta = document.getElementById('float-cta');
  const backTop  = document.getElementById('back-to-top');
  const hero     = document.querySelector('.hero');

  function onScroll() {
    const threshold = hero ? hero.offsetHeight * 0.75 : 400;
    const pastHero  = window.scrollY > threshold;

    if (floatCta) floatCta.classList.toggle('visible', pastHero);
    if (backTop)  backTop.classList.toggle('visible', window.scrollY > 320);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  onScroll();
})();

/* =============================================
   FORMULARIO — fetch + animación de éxito
   ============================================= */
(function () {
  const form    = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn     = document.getElementById('submit-btn');
  const btnIdle       = document.getElementById('btn-idle');
  const btnLoading    = document.getElementById('btn-loading');
  const sendError     = document.getElementById('form-send-error');
  const successScreen = document.getElementById('form-success-screen');

  /* --- Contador de caracteres --- */
  const textarea = form.querySelector('textarea');
  const counter  = document.getElementById('char-counter');
  if (textarea && counter) {
    const max = parseInt(textarea.getAttribute('maxlength') || '1000', 10);
    textarea.addEventListener('input', function () {
      const len = textarea.value.length;
      counter.textContent = len + ' / ' + max;
      counter.classList.toggle('warn', len > max * 0.9);
    });
  }

  /* --- Validación individual --- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function validateField(input) {
    const grp = input.closest('.form-group');
    if (!grp) return true;
    const v = input.value.trim();
    let ok = true;

    if (input.required) {
      if (input.type === 'email')        ok = isEmail(v);
      else if (input.tagName === 'TEXTAREA') ok = v.length >= 10;
      else                               ok = v.length >= 2;
    }

    grp.classList.toggle('field-invalid', !ok);
    grp.classList.toggle('field-valid', ok && v.length > 0);
    return ok;
  }

  form.querySelectorAll('input[required], textarea[required]').forEach(function (el) {
    el.addEventListener('blur',  function () { validateField(el); });
    el.addEventListener('input', function () {
      if (el.closest('.form-group').classList.contains('field-invalid')) validateField(el);
    });
  });

  /* --- Estado del botón --- */
  function setLoading(on) {
    submitBtn.disabled           = on;
    btnIdle.style.display        = on ? 'none'        : 'inline-flex';
    btnLoading.style.display     = on ? 'inline-flex' : 'none';
  }

  /* --- Pantalla de éxito --- */
  function showSuccess() {
    form.style.display           = 'none';
    sendError.style.display      = 'none';
    successScreen.classList.add('visible');
    successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* --- Submit --- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    sendError.style.display = 'none';

    const inputs = Array.from(form.querySelectorAll('input[required], textarea[required]'));
    const valid  = inputs.map(validateField).every(Boolean);

    if (!valid) {
      const first = form.querySelector('.field-invalid input, .field-invalid textarea');
      if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://formspree.io/f/xjgddzjd', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        showSuccess();
      } else {
        const json = await res.json().catch(() => ({}));
        console.error('Formspree error:', json);
        sendError.style.display = 'flex';
        setLoading(false);
      }
    } catch (err) {
      console.error('Network error:', err);
      sendError.style.display = 'flex';
      setLoading(false);
    }
  });
})();

/* =============================================
   BUDGET BARS — animar al entrar en viewport
   ============================================= */
(function () {
  const fills = document.querySelectorAll('.budget-fill');
  if (!fills.length || !('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width;
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(function (el) {
    el.dataset.width = el.style.width;
    el.style.width   = '0';
    obs.observe(el);
  });
})();

/* =============================================
   SCROLL REVEAL
   ============================================= */
(function () {
  const els = document.querySelectorAll(
    '.platform-card, .tier-card, .about-card, .transparency-card, .contact-form-wrap'
  );
  if (!els.length || !('IntersectionObserver' in window)) return;

  els.forEach(function (el, i) {
    el.classList.add('reveal-ready');
    el.style.transitionDelay = (i % 3) * 90 + 'ms';
  });

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(function (el) { obs.observe(el); });
})();

/* =============================================
   ACTIVE NAV LINK
   ============================================= */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a, .mobile-nav-link');
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(function (s) { obs.observe(s); });
})();
