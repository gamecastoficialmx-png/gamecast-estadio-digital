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
      badge:     '🎮 Comunidad Gamer en Español',
      heroLine1: 'El juego no para',
      heroLine2: 'si juegas con nosotros.',
      heroSub:   'Game Cast Estadio Digital es una comunidad independiente dedicada a videojuegos, deportes electrónicos y cultura gamer. Tu apoyo mantiene el contenido vivo, libre y accesible para todos.',
      heroCta1: 'Apoyar ahora', heroCta2: 'Contáctanos',
      stat1: 'Contenido gratuito', stat2: 'Sin plataformas cerradas', stat3: 'Sin publicidad invasiva',
      navDonar: 'Donar', navTrans: 'Transparencia', navCont: 'Contacto', navCta: 'Apoya ahora',
      hamburger: 'Abrir menú',
      about1t: 'Podcast & streams',
      about1d: 'Episodios semanales sobre los últimos lanzamientos, torneos y cultura gamer.',
      about2t: 'Cobertura de torneos',
      about2d: 'Análisis en vivo de competencias de esports regionales e internacionales.',
      about3t: 'Comunidad real',
      about3d: 'Discord activo, eventos colaborativos y espacio para jugadores de todos los niveles.',
      donateH:   '¿A dónde va tu donación?',
      donateSub: 'Tu donación llega directamente a nosotros. Sin comisiones de plataforma ni intermediarios opacos.',
      kofiDesc:   'Donación única sin registro obligatorio. Ideal para apoyar rápidamente. <strong>Sin comisión de plataforma</strong>; solo aplica la tarifa de PayPal.',
      kofiF:      ['✔ Sin registro del donante', '✔ Pago con tarjeta o PayPal', '✔ Donación única o mensual', '✔ Fácil y rápido'],
      kofiBtn:    'Donar con Ko-fi',
      paypalDesc: 'La forma más directa de donar. Sin plataforma intermediaria, el dinero llega directo a nuestro PayPal.',
      paypalF:    ['✔ Sin intermediarios', '✔ Pago con tarjeta o saldo PayPal', '✔ Seguro y confiable', '✔ Donación en cualquier monto'],
      paypalBtn:  'Donar por PayPal',
      transH:     'Transparencia total',
      transIntro: 'Creemos que quien dona merece saber exactamente a dónde va su dinero. Por eso usamos plataformas establecidas y publicamos regularmente cómo se invierten los fondos.',
      transItems: [
        { title: 'Donación directa',       desc: 'Ko-fi y PayPal transfieren el dinero directamente a nuestra cuenta, sin intermediarios adicionales.' },
        { title: 'Gastos públicos',        desc: 'Publicamos mensualmente un resumen de en qué se usan los fondos en nuestro Discord y redes sociales.' },
        { title: 'Sin comisiones ocultas', desc: 'Ko-fi no cobra comisión de plataforma. Solo aplica la tarifa estándar de procesamiento de PayPal.' },
      ],
      transBudgetTitle:  '¿Para qué se usa el dinero?',
      transBudgetLabels: ['Infraestructura (hosting, streaming)', 'Equipo (micrófonos, software)', 'Eventos y torneos comunitarios'],
      transBudgetNote:   'Actualizado mensualmente. Consulta el detalle en nuestro Discord →',
      platformBadge:     'Recomendado',
      paypalSoonNote:    '⚙️ Enlace en configuración · disponible pronto',
      contactH:   '¿Tienes preguntas?',
      contactSub: 'Escríbenos sobre donaciones, patrocinios, colaboraciones o simplemente para saludar.',
      formSubtitle: 'Respondemos en menos de 48 horas',
      formName: 'Nombre', formEmail: 'Correo electrónico', formSubj: 'Asunto', formMsg: 'Mensaje',
      formPName: 'Tu nombre', formPEmail: 'tu@correo.com', formPMsg: '¿En qué podemos ayudarte?',
      selectOpts: ['Selecciona un tema…', 'Pregunta sobre donaciones', 'Patrocinio o colaboración', 'Unirme a la comunidad', 'Otro'],
      formErrName: 'Por favor escribe tu nombre.',
      formErrEmail: 'Ingresa un correo válido.',
      formErrMsg: 'Escribe un mensaje de al menos 10 caracteres.',
      formBtn: 'Enviar mensaje', formBtnLoading: 'Enviando…',
      formSendErrTitle: 'Error al enviar',
      formSendErrDesc:  'Intenta de nuevo o escríbenos por Discord.',
      succH: '¡Gracias por comunicarte con nosotros!',
      succP: 'Tu mensaje fue enviado correctamente.<br/>Te responderemos pronto. 🎮',
      footerBrand:    'Comunidad gamer independiente. Hecho con ❤️ por jugadores, para jugadores.',
      footerCols:     ['Donaciones', 'Comunidad', 'Info'],
      footerCopy:     '© 2026 Game Cast Estadio Digital · Contenido libre ·',
      footerTechPre:  'Sitio alojado en',
      footerTechPost: '· Plataformas open source',
      tts: 'Game Cast Estadio Digital es una comunidad independiente dedicada a videojuegos, deportes electrónicos y cultura gamer en español. Tu apoyo mantiene el contenido vivo, libre y accesible para todos. Puedes donar a través de Ko-fi, sin registro y sin comisión de plataforma, o directamente por PayPal, la forma más directa sin intermediarios. Para contactarnos escríbenos a gamecast punto oficial mx arroba gmail punto com, o únete a nuestro servidor de Discord y canal de Twitch.',
    },
    en: {
      badge:     '🎮 Spanish Gaming Community',
      heroLine1: 'The game never stops',
      heroLine2: 'when you play with us.',
      heroSub:   'Game Cast Estadio Digital is an independent community dedicated to video games, esports and gaming culture. Your support keeps the content alive, free and accessible for everyone.',
      heroCta1: 'Support now', heroCta2: 'Contact us',
      stat1: 'Free content', stat2: 'No closed platforms', stat3: 'No invasive ads',
      navDonar: 'Donate', navTrans: 'Transparency', navCont: 'Contact', navCta: 'Support now',
      hamburger: 'Open menu',
      about1t: 'Podcast & streams',
      about1d: 'Weekly episodes about the latest releases, tournaments and gaming culture.',
      about2t: 'Tournament coverage',
      about2d: 'Live analysis of regional and international esports competitions.',
      about3t: 'Real community',
      about3d: 'Active Discord, collaborative events and space for players of all levels.',
      donateH:   'Where does your donation go?',
      donateSub: 'Your donation goes directly to us. No platform fees or shady middlemen.',
      kofiDesc:   'One-time donation, no registration required. Perfect for quick support. <strong>No platform fee</strong>; only PayPal\'s standard rate applies.',
      kofiF:      ['✔ No donor registration', '✔ Pay by card or PayPal', '✔ One-time or monthly donation', '✔ Easy and fast'],
      kofiBtn:    'Donate with Ko-fi',
      paypalDesc: 'The most direct way to donate. No middleman platform — the money goes straight to our PayPal.',
      paypalF:    ['✔ No intermediaries', '✔ Pay by card or PayPal balance', '✔ Safe and reliable', '✔ Any amount you choose'],
      paypalBtn:  'Donate via PayPal',
      transH:     'Full transparency',
      transIntro: 'We believe that donors deserve to know exactly where their money goes. That\'s why we use established platforms and regularly share how the raised funds are used.',
      transItems: [
        { title: 'Direct donation', desc: 'Ko-fi and PayPal transfer the money directly to our account, with no additional intermediaries.' },
        { title: 'Public expenses', desc: 'We publish a monthly summary of how the funds are used on our Discord and social media.' },
        { title: 'No hidden fees',  desc: 'Ko-fi charges no platform commission. Only PayPal\'s standard processing rate applies.' },
      ],
      transBudgetTitle:  'What is the money used for?',
      transBudgetLabels: ['Infrastructure (hosting, streaming)', 'Equipment (microphones, software)', 'Community events and tournaments'],
      transBudgetNote:   'Updated monthly. Check the details on our Discord →',
      platformBadge:     'Recommended',
      paypalSoonNote:    '⚙️ Link being set up · available soon',
      contactH:   'Got questions?',
      contactSub: 'Write to us about donations, sponsorships, collaborations or just to say hi.',
      formSubtitle: 'We respond within 48 hours',
      formName: 'Name', formEmail: 'Email address', formSubj: 'Subject', formMsg: 'Message',
      formPName: 'Your name', formPEmail: 'you@email.com', formPMsg: 'How can we help you?',
      selectOpts: ['Select a topic…', 'Question about donations', 'Sponsorship or collaboration', 'Join the community', 'Other'],
      formErrName: 'Please enter your name.',
      formErrEmail: 'Please enter a valid email.',
      formErrMsg: 'Please write a message of at least 10 characters.',
      formBtn: 'Send message', formBtnLoading: 'Sending…',
      formSendErrTitle: 'Failed to send',
      formSendErrDesc:  'Please try again or reach us on Discord.',
      succH: 'Thanks for reaching out!',
      succP: 'Your message was sent successfully.<br/>We\'ll get back to you soon. 🎮',
      footerBrand:    'Independent gaming community. Made with ❤️ by players, for players.',
      footerCols:     ['Donations', 'Community', 'Info'],
      footerCopy:     '© 2026 Game Cast Estadio Digital · Free content ·',
      footerTechPre:  'Hosted on',
      footerTechPost: '· Open source platforms',
      tts: 'Game Cast Estadio Digital is an independent community dedicated to video games, esports and gaming culture. Your support keeps the content alive, free and accessible for everyone. You can donate through Ko-fi, no registration and no platform fee, or directly through PayPal with no intermediaries. To contact us, email gamecast dot oficial mx at gmail dot com, or join our Discord server and Twitch channel.',
    }
  };

  var lang     = localStorage.getItem('gc_lang') || 'es';
  var hc       = localStorage.getItem('gc_hc') === '1';
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

    /* badge + hero */
    txt(document.querySelector('.hero-badge'), t.badge);
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

    /* stats */
    var sl = document.querySelectorAll('.stat-label');
    txt(sl[0], t.stat1); txt(sl[1], t.stat2); txt(sl[2], t.stat3);

    /* nav */
    var hbg = document.getElementById('nav-hamburger');
    if (hbg) hbg.setAttribute('aria-label', t.hamburger);
    document.querySelectorAll('.nav-links a, .mobile-nav-link').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h === '#donar')         txt(a, t.navDonar);
      if (h === '#transparencia') txt(a, t.navTrans);
      if (h === '#contacto')      txt(a, t.navCont);
    });
    document.querySelectorAll('.btn-nav, .mobile-nav-cta').forEach(function (el) { txt(el, t.navCta); });

    /* about */
    var ac = document.querySelectorAll('.about-card');
    [[t.about1t,t.about1d],[t.about2t,t.about2d],[t.about3t,t.about3d]].forEach(function (d, i) {
      if (!ac[i]) return;
      txt(ac[i].querySelector('h3'), d[0]);
      txt(ac[i].querySelector('p'),  d[1]);
    });

    /* donate heading + badge + paypal note */
    var donHead = document.querySelector('#donar .section-head');
    if (donHead) { txt(donHead.querySelector('h2'), t.donateH); txt(donHead.querySelector('p'), t.donateSub); }
    txt(document.getElementById('platform-badge-featured'), t.platformBadge);
    txt(document.getElementById('platform-soon-note'), t.paypalSoonNote);

    /* platform cards */
    var cards = document.querySelectorAll('.platform-card');
    var cardData = [
      { desc: t.kofiDesc,   features: t.kofiF,   btn: t.kofiBtn },
      { desc: t.paypalDesc, features: t.paypalF, btn: t.paypalBtn },
    ];
    cards.forEach(function (card, i) {
      var d = cardData[i]; if (!d) return;
      htm(card.querySelector('.platform-desc'), d.desc);
      card.querySelectorAll('.platform-features li').forEach(function (li, j) {
        if (d.features[j]) li.textContent = d.features[j];
      });
      txt(card.querySelector('.platform-btn'), d.btn);
    });

    /* transparency */
    txt(document.querySelector('#transparencia .transparency-text h2'), t.transH);
    txt(document.querySelector('#transparencia .transparency-text > p'), t.transIntro);
    document.querySelectorAll('.transparency-list li').forEach(function (li, i) {
      var td = t.transItems[i]; if (!td) return;
      txt(li.querySelector('strong'), td.title);
      txt(li.querySelector('p'),      td.desc);
    });
    txt(document.querySelector('.transparency-card h4'), t.transBudgetTitle);
    document.querySelectorAll('.budget-label > span:first-child').forEach(function (s, i) {
      if (t.transBudgetLabels[i]) s.textContent = t.transBudgetLabels[i];
    });
    txt(document.querySelector('.budget-note'), t.transBudgetNote);

    /* contact */
    txt(document.querySelector('#contacto .contact-info h2'), t.contactH);
    txt(document.querySelector('#contacto .contact-info > p'), t.contactSub);

    /* form */
    txt(document.querySelector('.form-subtitle'), t.formSubtitle);
    setLabelText('name',    t.formName);
    setLabelText('email',   t.formEmail);
    setLabelText('message', t.formMsg);
    txt(document.querySelector('label[for="subject"]'), t.formSubj);
    var fi = document.getElementById('name');    if (fi) fi.placeholder = t.formPName;
    var fe = document.getElementById('email');   if (fe) fe.placeholder = t.formPEmail;
    var fm = document.getElementById('message'); if (fm) fm.placeholder = t.formPMsg;
    document.querySelectorAll('#subject option').forEach(function (o, i) {
      if (t.selectOpts[i]) o.textContent = t.selectOpts[i];
    });
    var ferrs = document.querySelectorAll('.field-err');
    txt(ferrs[0], t.formErrName); txt(ferrs[1], t.formErrEmail); txt(ferrs[2], t.formErrMsg);
    txt(document.querySelector('#form-send-error strong'), t.formSendErrTitle);
    txt(document.querySelector('#form-send-error p'),      t.formSendErrDesc);
    var btnIdle = document.getElementById('btn-idle');
    if (btnIdle) {
      btnIdle.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) n.nodeValue = ' ' + t.formBtn;
      });
    }
    var btnLoading = document.getElementById('btn-loading');
    if (btnLoading) {
      btnLoading.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) n.nodeValue = ' ' + t.formBtnLoading;
      });
    }

    /* success screen */
    htm(document.querySelector('.success-message h4'), t.succH);
    htm(document.querySelector('.success-message p'),  t.succP);

    /* footer */
    txt(document.querySelector('.footer-brand p'), t.footerBrand);
    document.querySelectorAll('.footer-col h5').forEach(function (h, i) {
      if (t.footerCols[i]) h.textContent = t.footerCols[i];
    });
    var footerPs = document.querySelectorAll('.footer-bottom p');
    if (footerPs[0]) {
      footerPs[0].childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) n.nodeValue = t.footerCopy + ' ';
      });
      txt(footerPs[0].querySelector('a'), t.navCont);
    }
    var ftEl = document.querySelector('.footer-tech');
    if (ftEl) {
      var ftNodes = Array.from(ftEl.childNodes).filter(function (n) { return n.nodeType === 3; });
      if (ftNodes[0]) ftNodes[0].nodeValue = t.footerTechPre + ' ';
      if (ftNodes[1]) ftNodes[1].nodeValue = ' ' + t.footerTechPost;
    }

    /* widget buttons */
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
    u.onend   = function () { speaking = false; ttsUI(); };
    u.onerror = function () { speaking = false; ttsUI(); };
    speaking = true; ttsUI(); // actualizar UI antes de speak() (fix Safari)
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
