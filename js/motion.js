/* Motion layer: page transitions, split-word headings, stagger, parallax, count-up, cursor, magnetic buttons. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = s => document.querySelector(s);
  let started = false, opened = false, introEnd = 0;
  const queue = [], para = new Set();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }, cur = { x: -100, y: -100, rx: -100, ry: -100 };
  let vel = 0, lastY = scrollY, rate = 1;

  const after = fn => opened ? setTimeout(fn, Math.max(0, introEnd - performance.now())) : queue.push(fn);

  function leave(href) {
    const c = document.createElement('div'); c.id = 'curtain'; c.className = 'enter';
    c.innerHTML = '<span class="display">Clinton <em>Vane</em></span>'; document.body.appendChild(c);
    c.offsetWidth; c.classList.add('leave');
    setTimeout(() => { location.href = href; }, 650);
  }

  function init() {
    if (started) return; started = true;
    const root = document.documentElement;
    if (reduce) { root.classList.add('ready'); opened = true; return; }

    const c = document.createElement('div'); c.id = 'curtain';
    c.innerHTML = '<span class="display">Clinton <em>Vane</em></span>'; document.body.appendChild(c);
    root.classList.add('ready');
    const open = () => {
      if (opened) return; opened = true; introEnd = performance.now() + 500;
      c.classList.add('open'); setTimeout(() => c.remove(), 1200);
      queue.splice(0).forEach(fn => setTimeout(fn, 480));
    };
    const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
    Promise.all([fonts, new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r))]).then(() => setTimeout(open, 250));
    setTimeout(open, 2600);

    // page transitions
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target || a.hasAttribute('download')) return;
      const u = new URL(a.href, location.href);
      if (!/^(https?|file):$/.test(u.protocol) || u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      e.preventDefault(); leave(u.href);
    });
    addEventListener('pageshow', e => { if (e.persisted) document.querySelectorAll('#curtain').forEach(x => x.remove()); });

    // scroll progress + header hide
    const prog = document.createElement('div'); prog.id = 'prog'; document.body.appendChild(prog);
    let lastDir = scrollY;
    addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      const h = $('#hdr'); if (h) h.style.transform = scrollY > 500 && scrollY > lastDir ? 'translateY(-110%)' : '';
      lastDir = scrollY;
    }, { passive: true });

    if (fine) {
      const el = document.createElement('div'); el.id = 'cur'; el.innerHTML = '<div id="cur-ring"><span></span></div>'; document.body.appendChild(el);
      root.classList.add('has-cursor');
      const ring = $('#cur-ring'), label = ring.firstChild;
      addEventListener('mousemove', e => { cur.x = e.clientX; cur.y = e.clientY; mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; ring.style.opacity = 1; });
      document.addEventListener('mouseleave', () => ring.style.opacity = 0);
      addEventListener('mouseover', e => {
        const t = e.target;
        const txt = t.closest('.hall-frame, .cursor-zoom-in, [data-cursor="view"]') ? 'View' : t.closest('.hall-view') ? 'Drag' : '';
        const hot = !txt && t.closest('a, button, input, select, textarea, summary, label');
        label.textContent = txt; ring.classList.toggle('label', !!txt); ring.classList.toggle('hot', !!hot);
      });
      // magnetic buttons
      document.addEventListener('mousemove', e => {
        const b = e.target.closest('.btn'); if (!b) return;
        const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      document.addEventListener('mouseout', e => { const b = e.target.closest?.('.btn'); if (b && !b.contains(e.relatedTarget)) b.style.transform = ''; });
    }
    requestAnimationFrame(frame);
  }

  function frame() {
    mouse.sx += (mouse.x - mouse.sx) * .06; mouse.sy += (mouse.y - mouse.sy) * .06;
    const ring = $('#cur-ring');
    if (ring) { cur.rx += (cur.x - cur.rx) * .2; cur.ry += (cur.y - cur.ry) * .2; ring.style.transform = `translate3d(${cur.rx}px,${cur.ry}px,0)`; }

    // parallax (scroll + mouse depth)
    para.forEach(el => {
      if (!el.isConnected) { para.delete(el); return; }
      const r = (el.parentElement || el).getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const speed = +el.dataset.parallax || 0, depth = +el.dataset.depth || 0, y = (r.top + r.height / 2 - innerHeight / 2) * -speed;
      el.style.translate = `${mouse.sx * depth}px ${y + mouse.sy * depth}px`;
    });

    // marquee speeds up with scroll velocity
    vel += ((scrollY - lastY) - vel) * .15; lastY = scrollY;
    const m = $('.marquee');
    if (m) { const a = m.getAnimations()[0]; if (a) { const target = 1 + Math.min(Math.abs(vel), 60) * .12; rate += (target - rate) * .1; a.playbackRate = rate; } }
    requestAnimationFrame(frame);
  }

  /* ----- heading word split ----- */
  function split(el) {
    el.dataset.split = 1; let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'), s = document.createElement('span');
          w.className = 'sw'; s.className = 'swi'; s.textContent = t; s.style.transitionDelay = (i++ * 70) + 'ms'; w.appendChild(s); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.hasAttribute('data-lucide') && n.tagName !== 'svg') walk(n);
    });
    walk(el);
    splitIo.observe(el);
  }
  const splitIo = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { splitIo.unobserve(e.target); after(() => e.target.classList.add('split-in')); }
  }), { threshold: .2 });

  /* ----- count up ----- */
  const countIo = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; countIo.unobserve(e.target);
    const el = e.target, m = el.textContent.trim().match(/^([\d,]+)(\+?)$/), n = +m[1].replace(/,/g, ''), comma = m[1].includes(','), t0 = performance.now(), D = 1600;
    const tick = t => { const k = Math.min(1, (t - t0) / D), v = Math.round(n * (1 - Math.pow(1 - k, 4))); el.textContent = (comma ? v.toLocaleString() : v) + m[2]; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });

  function scan(root = document) {
    if (reduce) return;
    ['#grid', '#selected', '#rows', '#subjects', '#stats', '#counters'].forEach(sel => {
      const els = root.matches && root.matches(sel) ? [root] : [...root.querySelectorAll(sel)];
      els.forEach(c => [...c.children].forEach((k, i) => {
        if (k.dataset.st) return; k.dataset.st = 1; k.classList.add('reveal'); k.style.transitionDelay = (i % 6) * 70 + 'ms';
      }));
    });
    [...(root.matches && root.matches('h1,h2') ? [root] : []), ...root.querySelectorAll('h1,h2')]
      .filter(h => !h.dataset.split && !h.closest('#lb,#form,#preview')).forEach(split);
    root.querySelectorAll('#counters .display, #stats .display').forEach(el => {
      if (el.dataset.cu || !/^[\d,]+\+?$/.test(el.textContent.trim())) return; el.dataset.cu = 1; countIo.observe(el);
    });
    root.querySelectorAll('[data-parallax]').forEach(el => { if (el.tagName === 'IMG') el.style.scale = '1.14'; para.add(el); });
  }

  window.Motion = { init, scan, reduce };
})();
