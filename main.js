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

/* =============================================
   ACCESIBILIDAD: idioma, contraste, voz
   ============================================= */
(function () {

  var T = {
    es: {
      heroLine1: 'El juego no para',
      heroLine2: 'si juegas con nosotros.',
      heroSub:   'Game Cast Estadio Digital es una comunidad independiente dedicada a videojuegos, deportes electrónicos y cultura gamer. Tu apoyo mantiene el contenido vivo, libre y accesible para todos.',
      heroCta1:  'Apoyar ahora',
      heroCta2:  'Contáctanos',
      stat1: 'Contenido gratuito', stat2: 'Sin plataformas cerradas', stat3: 'Sin publicidad invasiva',
      navDonar: 'Donar', navTrans: 'Transparencia', navCont: 'Contacto', navCta: 'Apoya ahora',
      about1t: 'Podcast & streams',
      about1d: 'Episodios semanales sobre los últimos lanzamientos, torneos y cultura gamer.',
      about2t: 'Cobertura de torneos',
      about2d: 'Análisis en vivo de competencias de esports regionales e internacionales.',
      about3t: 'Comunidad real',
      about3d: 'Discord activo, eventos colaborativos y espacio para jugadores de todos los niveles.',
      donateH:   '¿A dónde va tu donación?',
      donateSub: 'Usamos plataformas 100% open source y transparentes. Sin intermediarios opacos.',
      kofiBtn: 'Donar con Ko-fi', paypalBtn: 'Donar por PayPal',
      transH:     'Transparencia total',
      contactH:   '¿Tienes preguntas?',
      contactSub: 'Escríbenos sobre donaciones, patrocinios, colaboraciones o simplemente para saludar.',
      formName: 'Nombre', formEmail: 'Correo electrónico', formSubj: 'Asunto', formMsg: 'Mensaje',
      formBtn: 'Enviar mensaje',
      succH: '¡Gracias por comunicarte con nosotros!',
      succP: 'Tu mensaje fue enviado correctamente.<br/>Te responderemos pronto. 🎮',
      tts: 'Game Cast Estadio Digital es una comunidad independiente dedicada a videojuegos, deportes electrónicos y cultura gamer en español. Tu apoyo mantiene el contenido vivo, libre y accesible para todos. Puedes donar a través de Ko-fi, sin registro y sin comisión de plataforma, o directamente por PayPal, la forma más directa sin intermediarios. Para contactarnos escríbenos a gamecast punto oficial mx arroba gmail punto com, o únete a nuestro servidor de Discord y canal de Twitch.',
    },
    en: {
      heroLine1: 'The game never stops',
      heroLine2: 'when you play with us.',
      heroSub:   'Game Cast Estadio Digital is an independent community dedicated to video games, esports and gaming culture. Your support keeps the content alive, free and accessible for everyone.',
      heroCta1:  'Support now',
      heroCta2:  'Contact us',
      stat1: 'Free content', stat2: 'No closed platforms', stat3: 'No invasive ads',
      navDonar: 'Donate', navTrans: 'Transparency', navCont: 'Contact', navCta: 'Support now',
      about1t: 'Podcast & streams',
      about1d: 'Weekly episodes about the latest releases, tournaments and gaming culture.',
      about2t: 'Tournament coverage',
      about2d: 'Live analysis of regional and international esports competitions.',
      about3t: 'Real community',
      about3d: 'Active Discord, collaborative events and space for players of all levels.',
      donateH:   'Where does your donation go?',
      donateSub: 'We use 100% transparent open source platforms. No shady middlemen.',
      kofiBtn: 'Donate with Ko-fi', paypalBtn: 'Donate via PayPal',
      transH:     'Full transparency',
      contactH:   'Got questions?',
      contactSub: 'Write to us about donations, sponsorships, collaborations or just to say hi.',
      formName: 'Name', formEmail: 'Email address', formSubj: 'Subject', formMsg: 'Message',
      formBtn: 'Send message',
      succH: 'Thanks for reaching out!',
      succP: 'Your message was sent successfully.<br/>We\'ll get back to you soon. 🎮',
      tts: 'Game Cast Estadio Digital is an independent community dedicated to video games, esports and gaming culture. Your support keeps the content alive, free and accessible for everyone. You can donate through Ko-fi, no registration and no platform fee, or directly through PayPal with no intermediaries. To contact us, email gamecast dot oficial mx at gmail dot com, or join our Discord server and Twitch channel.',
    }
  };

  var lang    = localStorage.getItem('gc_lang') || 'es';
  var hc      = localStorage.getItem('gc_hc') === '1';
  var speaking = false;

  function txt(el, s) { if (el) el.textContent = s; }
  function htm(el, s) { if (el) el.innerHTML   = s; }

  function setLabelText(forAttr, s) {
    var lbl = document.querySelector('label[for="' + forAttr + '"]');
    if (!lbl) return;
    lbl.childNodes.forEach(function (n) {
      if (n.nodeType === 3) n.nodeValue = s + ' ';
    });
  }

  function applyLang(l) {
    var t = T[l]; if (!t) return;
    lang = l;
    document.documentElement.lang = l;
    localStorage.setItem('gc_lang', l);

    var heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) {
          var ws = n.nodeValue.match(/^\s*/)[0];
          n.nodeValue = ws + t.heroLine1;
        }
      });
      txt(heroTitle.querySelector('.accent'), t.heroLine2);
    }
    txt(document.querySelector('.hero-sub'), t.heroSub);

    var hCtas = document.querySelectorAll('.hero-actions .btn');
    txt(hCtas[0], t.heroCta1); txt(hCtas[1], t.heroCta2);

    var sl = document.querySelectorAll('.stat-label');
    txt(sl[0], t.stat1); txt(sl[1], t.stat2); txt(sl[2], t.stat3);

    txt(document.querySelector('.hero-badge'), t.heroLine1 !== 'El juego no para'
      ? '🎮 Gaming Community in Spanish'
      : '🎮 Comunidad Gamer en Español');

    document.querySelectorAll('.nav-links a, .mobile-nav-link').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h === '#donar')         txt(a, t.navDonar);
      if (h === '#transparencia') txt(a, t.navTrans);
      if (h === '#contacto')      txt(a, t.navCont);
    });
    document.querySelectorAll('.btn-nav, .mobile-nav-cta').forEach(function (el) { txt(el, t.navCta); });

    var ac = document.querySelectorAll('.about-card');
    [[t.about1t,t.about1d],[t.about2t,t.about2d],[t.about3t,t.about3d]].forEach(function (d, i) {
      if (!ac[i]) return;
      txt(ac[i].querySelector('h3'), d[0]);
      txt(ac[i].querySelector('p'),  d[1]);
    });

    var donHead = document.querySelector('#donar .section-head');
    if (donHead) { txt(donHead.querySelector('h2'), t.donateH); txt(donHead.querySelector('p'), t.donateSub); }

    var pb = document.querySelectorAll('.platform-btn');
    txt(pb[0], t.kofiBtn); txt(pb[1], t.paypalBtn);

    txt(document.querySelector('#transparencia .transparency-text h2'), t.transH);
    txt(document.querySelector('#contacto .contact-info h2'), t.contactH);
    txt(document.querySelector('#contacto .contact-info > p'), t.contactSub);

    setLabelText('name',    t.formName);
    setLabelText('email',   t.formEmail);
    setLabelText('message', t.formMsg);
    txt(document.querySelector('label[for="subject"]'), t.formSubj);

    var btnIdle = document.getElementById('btn-idle');
    if (btnIdle) {
      btnIdle.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) n.nodeValue = ' ' + t.formBtn;
      });
    }

    htm(document.querySelector('.success-message h4'), t.succH);
    htm(document.querySelector('.success-message p'),  t.succP);

    document.querySelectorAll('.a11y-lang-btn').forEach(function (b) {
      b.classList.toggle('a11y-active', b.dataset.lang === l);
    });
  }

  function applyContrast(on) {
    hc = on;
    document.body.classList.toggle('high-contrast', on);
    localStorage.setItem('gc_hc', on ? '1' : '0');
    document.querySelectorAll('.a11y-contrast-btn').forEach(function (b) {
      b.classList.toggle('a11y-active', b.dataset.contrast === (on ? 'high' : 'normal'));
    });
  }

  function ttsStart() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(T[lang].tts);
    u.lang = lang === 'en' ? 'en-US' : 'es-MX';
    u.rate = 0.92;
    u.onstart = function () { speaking = true;  ttsUI(); };
    u.onend   = function () { speaking = false; ttsUI(); };
    u.onerror = function () { speaking = false; ttsUI(); };
    window.speechSynthesis.speak(u);
  }

  function ttsStop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speaking = false; ttsUI();
  }

  function ttsUI() {
    var p = document.getElementById('a11y-tts-play');
    var s = document.getElementById('a11y-tts-stop');
    if (p) p.disabled = speaking;
    if (s) s.disabled = !speaking;
  }

  /* ── widget ── */
  var wrap = document.createElement('div');
  wrap.className = 'a11y-widget';
  wrap.innerHTML =
    '<button class="a11y-toggle" id="a11y-toggle" aria-label="Opciones de accesibilidad" aria-expanded="false">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="4" r="1.5"/><path d="M9 9h6l-1 8-2-3-2 3z"/>' +
        '<path d="M7 15c1.2 2 2.8 3 5 3s3.8-1 5-3"/>' +
      '</svg>' +
    '</button>' +
    '<div class="a11y-panel" id="a11y-panel" aria-hidden="true">' +
      '<p class="a11y-panel-title">Accesibilidad</p>' +
      '<div class="a11y-group">' +
        '<span class="a11y-label">🌐 Idioma / Language</span>' +
        '<div class="a11y-btns">' +
          '<button class="a11y-lang-btn" data-lang="es">ES</button>' +
          '<button class="a11y-lang-btn" data-lang="en">EN</button>' +
        '</div>' +
      '</div>' +
      '<div class="a11y-group">' +
        '<span class="a11y-label">🎨 Contraste / Contrast</span>' +
        '<div class="a11y-btns">' +
          '<button class="a11y-contrast-btn" data-contrast="normal">Normal</button>' +
          '<button class="a11y-contrast-btn" data-contrast="high">Alto / High</button>' +
        '</div>' +
      '</div>' +
      '<div class="a11y-group">' +
        '<span class="a11y-label">🔊 Leer / Read aloud</span>' +
        '<div class="a11y-btns">' +
          '<button id="a11y-tts-play">▶ Leer</button>' +
          '<button id="a11y-tts-stop" disabled>■ Detener</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(wrap);

  var toggleBtn = document.getElementById('a11y-toggle');
  var panel     = document.getElementById('a11y-panel');

  toggleBtn.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden',       String(!open));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  document.querySelectorAll('.a11y-lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });
  document.querySelectorAll('.a11y-contrast-btn').forEach(function (b) {
    b.addEventListener('click', function () { applyContrast(b.dataset.contrast === 'high'); });
  });

  var playBtn = document.getElementById('a11y-tts-play');
  var stopBtn = document.getElementById('a11y-tts-stop');
  if (playBtn) playBtn.addEventListener('click', ttsStart);
  if (stopBtn) stopBtn.addEventListener('click', ttsStop);

  applyLang(lang);
  applyContrast(hc);
  ttsUI();

})();
