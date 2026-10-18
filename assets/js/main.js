(function () {
  'use strict';

  // Horário de funcionamento (0 = domingo … 6 = sábado). null = fechado.
  // Ao alterar aqui, atualize também a tabela em index.html e o JSON-LD.
  var HOURS = {
    0: null,
    1: [9, 19],
    2: [9, 19],
    3: [9, 19],
    4: [9, 19],
    5: [9, 19],
    6: [9, 19]
  };
  var DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');

  // ---------- Menu mobile ----------
  function setNav(open) {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () {
    setNav(!root.classList.contains('nav-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('nav-open')) {
      setNav(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 921px)').addEventListener('change', function (e) {
    if (e.matches) setNav(false);
  });

  // ---------- Cabeçalho ao rolar ----------
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Aberto / fechado agora (horário de Brasília) ----------
  function nowInSaoPaulo() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[map.weekday], minutes: Number(map.hour) * 60 + Number(map.minute) };
  }

  function openingStatus() {
    var now = nowInSaoPaulo();
    var today = HOURS[now.day];
    if (today && now.minutes >= today[0] * 60 && now.minutes < today[1] * 60) {
      return { open: true, text: 'Aberto agora · até as ' + today[1] + 'h', day: now.day };
    }
    if (today && now.minutes < today[0] * 60) {
      return { open: false, text: 'Fechado · abre hoje às ' + today[0] + 'h', day: now.day };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) {
        var when = i === 1 ? 'amanhã' : DAY_NAMES[d];
        return { open: false, text: 'Fechado · abre ' + when + ' às ' + HOURS[d][0] + 'h', day: now.day };
      }
    }
    return { open: false, text: 'Fechado', day: now.day };
  }

  function renderStatus() {
    var s;
    try { s = openingStatus(); } catch (err) { return; }
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
      el.hidden = false;
    });
    document.querySelectorAll('.hours tr[data-day]').forEach(function (tr) {
      tr.classList.toggle('is-today', Number(tr.dataset.day) === s.day);
    });
  }
  renderStatus();
  setInterval(renderStatus, 60 * 1000);

  // ---------- Animação de entrada ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- Ano no rodapé ----------
  var year = document.getElementById('ano');
  if (year) year.textContent = new Date().getFullYear();
})();
