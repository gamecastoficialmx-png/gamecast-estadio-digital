/* =========================================
   Game Cast Estadio Digital — main.js
   ========================================= */

/* =============================================
   FORMULARIO — fetch + animación de éxito
   ============================================= */
(function () {
  const form       = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn   = document.getElementById('submit-btn');
  const btnIdle     = document.getElementById('btn-idle');
  const btnLoading  = document.getElementById('btn-loading');
  const sendError   = document.getElementById('form-send-error');
  const successScreen = document.getElementById('form-success-screen');

  /* --- Validación individual --- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function validateField(input) {
    const grp = input.closest('.form-group');
    if (!grp) return true;
    const v = input.value.trim();
    let ok = true;

    if (input.required) {
      if (input.type === 'email') ok = isEmail(v);
      else if (input.tagName === 'TEXTAREA') ok = v.length >= 10;
      else ok = v.length >= 2;
    }

    grp.classList.toggle('field-invalid', !ok);
    grp.classList.toggle('field-valid', ok && v.length > 0);
    return ok;
  }

  /* Validación en tiempo real */
  form.querySelectorAll('input[required], textarea[required]').forEach(function (el) {
    el.addEventListener('blur', function () { validateField(el); });
    el.addEventListener('input', function () {
      if (el.closest('.form-group').classList.contains('field-invalid')) validateField(el);
    });
  });

  /* --- Estado botón --- */
  function setLoading(on) {
    submitBtn.disabled = on;
    btnIdle.style.display    = on ? 'none'        : 'inline-flex';
    btnLoading.style.display = on ? 'inline-flex' : 'none';
  }

  /* --- Mostrar pantalla de éxito --- */
  function showSuccess() {
    form.style.display = 'none';
    sendError.style.display = 'none';
    successScreen.classList.add('visible');
    successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* --- Submit --- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    sendError.style.display = 'none';

    /* Validar todos los campos requeridos */
    const inputs = Array.from(form.querySelectorAll('input[required], textarea[required]'));
    const valid  = inputs.map(validateField).every(Boolean);

    if (!valid) {
      const first = form.querySelector('.field-invalid input, .field-invalid textarea');
      if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }

    setLoading(true);

    try {
      const data = new FormData(form);
      const res  = await fetch('https://formspree.io/f/xjgddzjd', {
        method: 'POST',
        body: data,
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
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  els.forEach(function (el) { obs.observe(el); });
})();

/* =============================================
   ACTIVE NAV LINK
   ============================================= */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
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
