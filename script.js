/* ESTÉRUM — главный экран: галерея коллекции и появление при загрузке */

(function () {
  'use strict';

  var STATES = [
    { key: 'amethyst',   name: 'Аметист',       mood: 'Покой',    scent: 'слива и кашемир' },
    { key: 'aventurine', name: 'Авантюрин',     mood: 'Ясность',  scent: 'бергамот, нероли и апельсин' },
    { key: 'obsidian',   name: 'Обсидиан',      mood: 'Глубина',  scent: 'табак и ваниль' },
    { key: 'quartz',     name: 'Розовый кварц', mood: 'Нежность', scent: 'миндаль и цветы вишни' }
  ];

  var AUTOPLAY = 6000;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var layerA   = document.getElementById('stage-a');
  var layerB   = document.getElementById('stage-b');
  var caption  = document.querySelector('.caption');
  var capText  = caption.querySelector('.cap-t');
  var thumbsEl = document.querySelector('.thumbs');
  var dotsEl   = document.querySelector('.dots');

  var current = 0;
  var front = layerA;          // слой, который сейчас виден
  var back = layerB;
  var busy = false;
  var timer = null;

  function alt(s) {
    return 'Свеча ESTÉRUM с натуральным минералом «' + s.name + '» и подарочная коробка';
  }

  /* ------------------------------- превью ------------------------------ */

  function renderThumbs() {
    thumbsEl.textContent = '';
    for (var i = 1; i <= 3; i++) {
      var s = STATES[(current + i) % STATES.length];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', s.name + ' — ' + s.mood + ', ' + s.scent);
      b.dataset.index = String((current + i) % STATES.length);
      b.style.setProperty('--d', (0.5 + i * 0.12) + 's');

      var img = document.createElement('img');
      img.src = 'images/' + s.key + '-thumb.jpg';
      img.alt = '';
      img.loading = 'lazy';
      b.appendChild(img);

      b.addEventListener('click', onThumb);
      thumbsEl.appendChild(b);
    }
  }

  function onThumb(e) {
    var btn = e.currentTarget;
    btn.classList.add('leaving');
    go(Number(btn.dataset.index), true);
  }

  /* -------------------------------- точки ------------------------------ */

  function renderDots() {
    dotsEl.textContent = '';
    STATES.forEach(function (s, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', s.name);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      d.addEventListener('click', function () { go(i, true); });
      dotsEl.appendChild(d);
    });
  }

  function syncDots() {
    Array.prototype.forEach.call(dotsEl.children, function (d, i) {
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  /* ----------------------------- перелистывание ------------------------ */

  function go(index, manual) {
    if (busy || index === current) return;
    busy = true;
    if (manual) stop();

    var s = STATES[index];

    back.src = 'images/' + s.key + '.jpg';
    back.alt = alt(s);

    caption.classList.add('out');

    var finish = function () {
      current = index;
      syncDots();
      renderThumbs();
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(thumbsEl.children, function (t) { t.classList.remove('leaving'); });
      });
      busy = false;
      if (!manual || !document.hidden) start();
    };

    var swapCaption = function () {
      capText.textContent = s.name + ' · ' + s.mood;
      caption.classList.remove('out');
    };

    var reveal = function () {
      back.classList.add('is-front');
      back.removeAttribute('aria-hidden');
      front.classList.remove('is-front');
      front.setAttribute('aria-hidden', 'true');
      var t = front; front = back; back = t;   // слои меняются ролями

      if (calm) { swapCaption(); finish(); return; }
      setTimeout(swapCaption, 430);
      setTimeout(finish, 900);
    };

    if (back.complete && back.naturalWidth) reveal();
    else back.addEventListener('load', reveal, { once: true });
  }

  function next() { go((current + 1) % STATES.length, false); }

  /* ------------------------------ автоплей ----------------------------- */

  function start() {
    if (calm) return;
    stop();
    timer = setTimeout(next, AUTOPLAY);
  }
  function stop() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  var gallery = document.querySelector('.gallery');
  gallery.addEventListener('mouseenter', stop);
  gallery.addEventListener('mouseleave', start);
  gallery.addEventListener('focusin', stop);
  gallery.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  document.addEventListener('keydown', function (e) {
    if (!gallery.contains(document.activeElement)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go((current + 1) % STATES.length, true); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go((current + STATES.length - 1) % STATES.length, true); }
  });

  /* --------------------------- мобильное меню -------------------------- */

  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  function setMenu(open) {
    if (open) { menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden', ''); }
    document.body.classList.toggle('menu-open', open);   // фон не скроллится под меню
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? 'Закрыть' : 'Меню';
  }
  burger.addEventListener('click', function () {
    setMenu(menu.hasAttribute('hidden'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hasAttribute('hidden')) setMenu(false);
  });

  /* -------------------- появление первого экрана ----------------------- */

  var delays = [
    ['.header-in', 0],
    ['.eyebrow', 0.08],
    ['.lede', 0.36],
    ['.actions', 0.46],
    ['.specs', 0.56],
    ['.caption', 0.9],
    ['.dots', 0.8]
  ];
  delays.forEach(function (pair) {
    var el = document.querySelector(pair[0]);
    if (el) el.style.setProperty('--d', pair[1] + 's');
  });
  var lines = document.querySelectorAll('.title .ln > span');
  Array.prototype.forEach.call(lines, function (l, i) {
    l.style.setProperty('--d', (0.16 + i * 0.08) + 's');
  });

  renderThumbs();
  renderDots();

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add('ready');
      start();
    });
  });
})();
