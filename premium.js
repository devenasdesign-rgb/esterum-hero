/* ESTÉRUM — главный экран «сцена»: выбор свечи, появление, движение */

(function () {
  'use strict';

  var STATES = [
    { key: 'amethyst',   name: 'Аметист',       mood: 'Покой',    scent: 'слива и кашемир' },
    { key: 'aventurine', name: 'Авантюрин',     mood: 'Ясность',  scent: 'бергамот, нероли и апельсин' },
    { key: 'obsidian',   name: 'Обсидиан',      mood: 'Глубина',  scent: 'табак и ваниль' },
    { key: 'quartz',     name: 'Розовый кварц', mood: 'Нежность', scent: 'миндаль и цветы вишни' }
  ];

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var tray  = document.querySelector('.tray');
  var mark  = document.querySelector('.scene-mark');
  var scene = document.querySelector('.scene');
  var current = 0;

  /* ------------------------------ карточки ----------------------------- */

  STATES.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'card';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.setAttribute('aria-label', s.name + ' — ' + s.mood + ', ' + s.scent);
    b.style.setProperty('--d', (0.75 + i * 0.1) + 's');

    var shot = document.createElement('span');
    shot.className = 'shot';
    var img = document.createElement('img');
    img.src = 'images/' + s.key + '-thumb.jpg';
    img.alt = '';
    img.loading = i === 0 ? 'eager' : 'lazy';
    shot.appendChild(img);

    var name = document.createElement('span');
    name.className = 'name';
    name.textContent = s.name;

    b.appendChild(shot);
    b.appendChild(name);
    b.addEventListener('click', function () { select(i); });
    tray.appendChild(b);
  });

  var cards = tray.querySelectorAll('.card');

  function select(i) {
    if (i === current) return;
    current = i;
    Array.prototype.forEach.call(cards, function (c, n) {
      c.setAttribute('aria-selected', n === i ? 'true' : 'false');
    });
    var s = STATES[i];
    mark.style.opacity = 0;
    setTimeout(function () {
      mark.textContent = s.name + ' · ' + s.mood;
      mark.style.opacity = 1;
    }, calm ? 0 : 320);
  }

  document.addEventListener('keydown', function (e) {
    if (!scene.contains(document.activeElement)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); select((current + 1) % STATES.length); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); select((current + STATES.length - 1) % STATES.length); }
  });

  /* ---------------------------- движение кадра ------------------------- */

  if (fine && !calm) {
    scene.addEventListener('mousemove', function (e) {
      var r = scene.getBoundingClientRect();
      scene.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      scene.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    });
    scene.addEventListener('mouseleave', function () {
      scene.style.setProperty('--px', 0);
      scene.style.setProperty('--py', 0);
    });

    var cta = document.querySelector('.btn');
    if (cta) {
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
  }

  /* --------------------------- мобильное меню -------------------------- */

  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  function setMenu(open) {
    if (open) { menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden', ''); }
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? 'Закрыть' : 'Меню';
  }
  burger.addEventListener('click', function () { setMenu(menu.hasAttribute('hidden')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hasAttribute('hidden')) setMenu(false);
  });

  /* ------------------------ появление и заставка ----------------------- */

  [['.header-in', 0], ['.eyebrow', .1], ['.lede', .42], ['.actions', .52], ['.label-card', .62]]
    .forEach(function (p) {
      var el = document.querySelector(p[0]);
      if (el) el.style.setProperty('--d', p[1] + 's');
    });
  Array.prototype.forEach.call(document.querySelectorAll('.title .ln > span'), function (l, i) {
    l.style.setProperty('--d', (0.18 + i * 0.09) + 's');
  });

  var curtain = document.querySelector('.curtain');
  var seen = false;
  try { seen = sessionStorage.getItem('esterum-intro') === '1'; } catch (err) {}

  function openPage(delay) {
    setTimeout(function () { document.documentElement.classList.add('ready'); }, delay);
  }

  if (!curtain || calm || seen) {
    if (curtain) curtain.remove();
    requestAnimationFrame(function () { requestAnimationFrame(function () { openPage(0); }); });
  } else {
    try { sessionStorage.setItem('esterum-intro', '1'); } catch (err) {}
    requestAnimationFrame(function () { curtain.classList.add('on'); });
    setTimeout(function () {
      curtain.classList.add('lift');
      openPage(180);
      setTimeout(function () { curtain.remove(); }, 1100);
    }, 900);
  }
})();
