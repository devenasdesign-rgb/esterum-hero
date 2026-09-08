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

  var layerA   = document.getElementById('layer-a');
  var layerB   = document.getElementById('layer-b');
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

    var backImg = back.querySelector('img');
    backImg.src = 'images/' + s.key + '.jpg';
    backImg.alt = alt(s);

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
      var leaving = front;
      leaving.classList.remove('is-front');
      leaving.classList.add('under');          // остаётся под новым слоем, пока идёт шторка
      leaving.querySelector('img').setAttribute('aria-hidden', 'true');

      back.classList.add('is-front');
      backImg.removeAttribute('aria-hidden');

      var t = front; front = back; back = t;   // слои меняются ролями

      if (calm) {
        leaving.classList.remove('under');
        swapCaption(); finish();
        return;
      }
      setTimeout(swapCaption, 520);
      setTimeout(function () { leaving.classList.remove('under'); }, 1200);
      setTimeout(finish, 1200);
    };

    if (backImg.complete && backImg.naturalWidth) reveal();
    else backImg.addEventListener('load', reveal, { once: true });
  }

  function next() { go((current + 1) % STATES.length, false); }

  /* ------------------------------ автоплей ----------------------------- */

  function start() {
    if (calm) return;
    stop();
    dotsEl.classList.remove('paused');
    timer = setTimeout(next, AUTOPLAY);
  }
  function stop() {
    if (timer) { clearTimeout(timer); timer = null; }
    dotsEl.classList.add('paused');
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

  /* ------------------------- параллакс кадра --------------------------- */

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (fine && !calm) {
    gallery.addEventListener('mousemove', function (e) {
      var r = gallery.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width * 2 - 1;      // -1 … 1
      var py = (e.clientY - r.top) / r.height * 2 - 1;
      gallery.style.setProperty('--px', px.toFixed(3));
      gallery.style.setProperty('--py', py.toFixed(3));
    });
    gallery.addEventListener('mouseleave', function () {
      gallery.style.setProperty('--px', 0);
      gallery.style.setProperty('--py', 0);
    });
  }

  /* --------------------------- магнитная кнопка ------------------------ */

  var cta = document.querySelector('.btn');
  if (cta && fine && !calm) {
    var PULL = 7;
    cta.addEventListener('mousemove', function (e) {
      var r = cta.getBoundingClientRect();
      cta.style.setProperty('--mx', (((e.clientX - r.left) / r.width * 2 - 1) * PULL).toFixed(1) + 'px');
      cta.style.setProperty('--my', (((e.clientY - r.top) / r.height * 2 - 1) * PULL * 0.5).toFixed(1) + 'px');
    });
    cta.addEventListener('mouseleave', function () {
      cta.style.setProperty('--mx', '0px');
      cta.style.setProperty('--my', '0px');
    });
  }

  /* ------------------------------ заставка ----------------------------- */

  renderThumbs();
  renderDots();

  var curtain = document.querySelector('.curtain');
  var seen = false;
  try { seen = sessionStorage.getItem('esterum-intro') === '1'; } catch (err) { seen = false; }

  function openPage(delay) {
    setTimeout(function () {
      document.documentElement.classList.add('ready');
      start();
    }, delay);
  }

  if (!curtain || calm || seen) {
    if (curtain) curtain.remove();
    requestAnimationFrame(function () { requestAnimationFrame(function () { openPage(0); }); });
  } else {
    try { sessionStorage.setItem('esterum-intro', '1'); } catch (err) {}
    requestAnimationFrame(function () { curtain.classList.add('on'); });
    setTimeout(function () {
      curtain.classList.add('lift');
      openPage(180);                                  // содержимое встаёт следом за занавесом
      setTimeout(function () { curtain.remove(); }, 1100);
    }, 900);
  }
})();
