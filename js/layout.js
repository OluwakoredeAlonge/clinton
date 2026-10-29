/* Shared chrome: header, footer, lightbox, helpers. */
(function () {
  const { ARTIST, WORKS, EXHIBITIONS } = SITE;
  const LS = 'clinton.exhibitions.v1';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + Number(n).toLocaleString('en-US');
  const byId = Object.fromEntries(WORKS.map(w => [w.id, w]));

  /* ---------- data helpers ---------- */
  function stored() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
  function saveStored(map) { try { localStorage.setItem(LS, JSON.stringify(map)); return true; } catch (e) { return false; } }

  function norm(ex) {
    const rooms = (ex.rooms || []).map((r, i) => ({
      ...r, n: i + 1,
      works: (r.works || (r.workIds || []).map(id => byId[id])).filter(Boolean).map(w => ({ ...w, exh: ex.id })),
    }));
    return { ...ex, rooms, works: rooms.flatMap(r => r.works) };
  }
  function exhibitions({ drafts = false } = {}) {
    const all = [...EXHIBITIONS.map(norm), ...Object.values(stored()).map(e => ({ ...norm(e), user: true }))];
    return all.filter(e => drafts || !e.draft).sort((a, b) => b.start.localeCompare(a.start));
  }
  function allWorks() {
    const ids = new Set(), out = [];
    [...WORKS, ...exhibitions().filter(e => e.user).flatMap(e => e.works)].forEach(w => { if (!ids.has(w.id)) { ids.add(w.id); out.push(w); } });
    return out;
  }
  function status(ex) {
    if (ex.draft) return { key: 'draft', label: 'Draft' };
    const now = Date.now(), s = new Date(ex.start + 'T00:00:00'), e = new Date(ex.end + 'T23:59:59'), day = 864e5;
    if (now < s) { const d = Math.ceil((s - now) / day); return { key: 'upcoming', label: 'Opens in ' + d + ' day' + (d > 1 ? 's' : ''), days: d }; }
    if (now <= e) { const d = Math.ceil((e - now) / day); return { key: 'current', label: 'Now showing', days: d, note: d + ' day' + (d > 1 ? 's' : '') + ' left' }; }
    return { key: 'past', label: 'Closed' };
  }
  const fmt = (d, o) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', o);
  function range(ex) {
    const s = new Date(ex.start + 'T12:00:00'), e = new Date(ex.end + 'T12:00:00');
    const a = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + (s.getFullYear() !== e.getFullYear() ? ' ' + s.getFullYear() : '');
    return a + ' – ' + fmt(ex.end, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const dims = w => `${w.w} × ${w.h} cm`;

  /* ---------- image helper (the one place that decides placeholder vs real) ---------- */
  function img(item, o = {}) {
    const ratio = o.ratio || (item.w && item.h ? item.w / item.h : 1);
    const alt = esc(o.alt ?? item.title ?? '');
    const style = `aspect-ratio:${ratio};${o.style || ''}`;
    if (item.image) return `<img src="${item.image}" alt="${alt}" class="${o.cls || ''}" style="${style}" loading="lazy" decoding="async">`;
    return `<img data-art="${item.seed}|${item.style}|${item.pal}" data-ratio="${ratio}" data-res="${o.res || 640}" ${o.eager ? 'data-eager' : ''} alt="${alt}" class="${o.cls || ''}" style="${style}">`;
  }

  /* ---------- reveal / refresh ---------- */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: .1 });
  function refresh(root = document) {
    if (window.Motion) Motion.scan(root);
    Art.hydrate(root);
    root.querySelectorAll('.reveal:not(.in)').forEach(el => rio.observe(el));
    if (window.lucide) lucide.createIcons();
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-ink text-paper px-6 py-3 rounded-full text-sm shadow-2xl flex items-center gap-3';
    t.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-ember"></i>${esc(msg)}`;
    document.body.appendChild(t); lucide.createIcons();
    setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = 0; setTimeout(() => t.remove(), 400); }, 2800);
  }

  /* ---------- header / footer ---------- */
  const NAV = [['gallery.html', 'Gallery'], ['exhibitions.html', 'Exhibitions'], ['about.html', 'About'], ['contact.html', 'Commissions']];

  function header(active, dark) {
    const cur = exhibitions().find(e => status(e).key === 'current');
    return `
    <header id="hdr" class="fixed top-0 inset-x-0 z-50 transition-all duration-500 ${dark ? 'text-paper' : 'text-ink'}" data-dark="${dark ? 1 : 0}">
      <div class="max-w-[1500px] mx-auto px-5 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <a href="index.html" class="display text-[26px] md:text-3xl leading-none">Clinton <em>Vane</em></a>
        <nav class="hidden md:flex items-center gap-10 text-[12px] uppercase tracking-[.18em]">
          ${NAV.map(([h, l]) => `<a href="${h}" class="underline-grow py-1 ${active === h ? 'text-ember' : ''}">${l}</a>`).join('')}
        </nav>
        <div class="flex items-center gap-3">
          ${cur ? `<a href="exhibition.html?id=${cur.id}" class="hidden lg:inline-flex items-center gap-2 border border-current/30 rounded-full pl-3 pr-4 py-1.5 text-[11px] uppercase tracking-[.14em] hover:bg-ember hover:border-ember hover:text-white transition"><span class="w-1.5 h-1.5 rounded-full bg-ember animate-pulse"></span>Now showing</a>` : ''}
          <button id="menu-btn" class="md:hidden p-2 -mr-2" aria-label="Menu"><i data-lucide="menu" class="w-6 h-6"></i></button>
        </div>
      </div>
    </header>
    <div id="menu" class="fixed inset-0 z-[60] bg-ink text-paper hidden flex-col p-6">
      <div class="flex justify-between items-center h-12"><span class="display text-2xl">Clinton <em>Vane</em></span><button id="menu-x" class="p-2"><i data-lucide="x" class="w-6 h-6"></i></button></div>
      <nav class="flex-1 flex flex-col justify-center gap-4">
        ${[['index.html', 'Home'], ...NAV].map(([h, l]) => `<a href="${h}" class="display text-6xl leading-none ${active === h ? 'text-ember' : ''}">${l}</a>`).join('')}
      </nav>
      <p class="eyebrow text-paper/50">${esc(ARTIST.email)}</p>
    </div>`;
  }

  function footer() {
    return `
    <footer class="bg-ink text-paper mt-0 overflow-hidden">
      <div class="max-w-[1500px] mx-auto px-5 md:px-10 pt-20 pb-10">
        <div class="grid md:grid-cols-12 gap-12">
          <div class="md:col-span-5">
            <p class="eyebrow text-paper/50 mb-4">Studio letter</p>
            <h3 class="display text-4xl md:text-5xl leading-[1.02] mb-6">Be first through the door when the next show opens.</h3>
            <form class="flex border-b border-paper/30 focus-within:border-ember transition max-w-md" onsubmit="event.preventDefault();Site.toast('Thank you, you are on the list.');this.reset()">
              <input type="email" required placeholder="Your email address" class="flex-1 bg-transparent py-3 outline-none placeholder:text-paper/40">
              <button class="px-2 hover:text-ember transition" aria-label="Subscribe"><i data-lucide="arrow-right" class="w-5 h-5"></i></button>
            </form>
          </div>
          <div class="md:col-span-2 md:col-start-8">
            <p class="eyebrow text-paper/50 mb-4">Explore</p>
            <ul class="space-y-2 text-sm">${[['index.html', 'Home'], ...NAV].map(([h, l]) => `<li><a class="hover:text-ember transition" href="${h}">${l}</a></li>`).join('')}</ul>
          </div>
          <div class="md:col-span-3">
            <p class="eyebrow text-paper/50 mb-4">Studio</p>
            <address class="not-italic text-sm space-y-2 text-paper/80">
              <p>${esc(ARTIST.address)}<br>${esc(ARTIST.city)}</p>
              <p><a class="hover:text-ember" href="mailto:${ARTIST.email}">${esc(ARTIST.email)}</a></p>
              <p>${esc(ARTIST.phone)}</p>
              <p class="flex gap-4 pt-2">${ARTIST.social.map(([l, h]) => `<a class="underline-grow" href="${h}">${l}</a>`).join('')}</p>
            </address>
          </div>
        </div>
        <p class="display text-[22vw] leading-[.8] mt-16 -mb-[3vw] text-paper/[.06] select-none whitespace-nowrap">Clinton Vane</p>
        <div class="flex flex-wrap justify-between gap-3 border-t border-paper/15 pt-6 mt-6 text-xs text-paper/50">
          <p>© ${new Date().getFullYear()} ${esc(ARTIST.name)}. All works are copyright of the artist.</p>
          <a href="admin.html" class="inline-flex items-center gap-2 hover:text-ember transition"><i data-lucide="lock-keyhole" class="w-3.5 h-3.5"></i>Studio desk</a>
        </div>
      </div>
    </footer>`;
  }

  /* ---------- lightbox ---------- */
  const LB = { list: [], i: 0, room: false };

  function lightboxShell() {
    document.body.insertAdjacentHTML('beforeend', `
    <div id="lb" class="fixed inset-0 z-[100] hidden bg-hall text-paper">
      <div class="h-full grid lg:grid-cols-[1fr_400px]">
        <div class="relative flex items-center justify-center p-5 pt-16 lg:p-12 min-h-0">
          <div id="lb-stage" class="w-full h-full flex items-center justify-center"></div>
          <button id="lb-prev" class="absolute left-2 lg:left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-paper/10 hover:bg-ember transition" aria-label="Previous"><i data-lucide="chevron-left" class="w-6 h-6"></i></button>
          <button id="lb-next" class="absolute right-2 lg:right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-paper/10 hover:bg-ember transition" aria-label="Next"><i data-lucide="chevron-right" class="w-6 h-6"></i></button>
        </div>
        <aside id="lb-info" class="bg-ink p-7 lg:p-9 overflow-y-auto max-h-[42vh] lg:max-h-none"></aside>
      </div>
      <button id="lb-x" class="absolute top-4 right-4 z-10 p-3 rounded-full bg-paper/10 hover:bg-ember transition" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button>
    </div>`);
    $('#lb-x').onclick = closeLb;
    $('#lb-prev').onclick = () => step(-1);
    $('#lb-next').onclick = () => step(1);
    document.addEventListener('keydown', e => {
      if ($('#lb').classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1);
    });
    $('#lb').addEventListener('click', e => { if (e.target.id === 'lb-stage') closeLb(); });
    window.addEventListener('resize', () => { if (LB.room && !$('#lb').classList.contains('hidden')) layoutRoom(); });
  }

  function openLb(list, i = 0) { LB.list = list; LB.i = i; LB.room = false; $('#lb').classList.remove('hidden'); document.body.style.overflow = 'hidden'; showLb(); }
  function closeLb() { $('#lb').classList.add('hidden'); document.body.style.overflow = ''; }
  function step(d) { LB.i = (LB.i + d + LB.list.length) % LB.list.length; showLb(); }

  function showLb() {
    const it = LB.list[LB.i], ex = it.exh && exhibitions({ drafts: true }).find(e => e.id === it.exh);
    $('#lb-stage').innerHTML = LB.room
      ? `<div id="roomwrap" class="relative w-full h-full overflow-hidden" style="background:linear-gradient(#e9e2d4,#d9d0be)"></div>`
      : `<figure class="flex flex-col items-center max-h-full">${img(it, { cls: 'object-contain shadow-2xl w-auto max-w-full', style: 'max-height:calc(100vh - 8rem)', res: 1200, eager: true })}</figure>`;
    const sold = ['Sold', 'Private collection'].includes(it.status);
    $('#lb-info').innerHTML = `
      <p class="eyebrow text-paper/50 mb-3">${esc(it.cat)} · ${String(LB.i + 1).padStart(2, '0')} / ${String(LB.list.length).padStart(2, '0')}</p>
      <h2 class="display text-5xl leading-[.95] mb-2">${esc(it.title)}</h2>
      <p class="text-paper/60 mb-7">${esc(it.year)}</p>
      <dl class="text-sm divide-y divide-paper/10 border-y border-paper/10 mb-6">
        <div class="flex justify-between py-3"><dt class="text-paper/50">Medium</dt><dd>${esc(it.medium)}</dd></div>
        <div class="flex justify-between py-3"><dt class="text-paper/50">Size</dt><dd>${dims(it)}</dd></div>
        <div class="flex justify-between py-3"><dt class="text-paper/50">Status</dt><dd class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ${sold ? 'bg-ember' : it.status === 'Reserved' ? 'bg-ochre' : 'bg-emerald-400'}"></span>${esc(it.status)}</dd></div>
        ${it.price && !sold ? `<div class="flex justify-between py-3"><dt class="text-paper/50">Price</dt><dd>${money(it.price)}</dd></div>` : ''}
      </dl>
      ${it.desc ? `<p class="text-paper/75 leading-relaxed mb-7">${esc(it.desc)}</p>` : ''}
      <div class="flex flex-col gap-3">
        ${sold ? '' : `<a href="contact.html?work=${it.id}" class="btn btn-light justify-center"><i data-lucide="mail" class="w-4 h-4"></i>Enquire about this work</a>`}
        <button id="lb-room" class="btn btn-line justify-center text-paper"><i data-lucide="${LB.room ? 'image' : 'sofa'}" class="w-4 h-4"></i>${LB.room ? 'Back to painting' : 'See it on a wall'}</button>
        ${ex ? `<a href="exhibition.html?id=${ex.id}" class="flex items-center justify-between border border-paper/15 p-4 rounded-sm hover:border-ember transition"><span><span class="eyebrow text-paper/50 block mb-1">Shown in</span><span class="display text-2xl">${esc(ex.title)}</span></span><i data-lucide="arrow-up-right" class="w-5 h-5"></i></a>` : ''}
      </div>`;
    $('#lb-room').onclick = () => { LB.room = !LB.room; showLb(); };
    refresh($('#lb'));
    if (LB.room) layoutRoom();
  }

  // true-to-scale living-room preview
  function layoutRoom() {
    const it = LB.list[LB.i], wrap = $('#roomwrap'); if (!wrap) return;
    const cw = wrap.clientWidth, ch = wrap.clientHeight, floor = ch * .17, wallH = ch - floor, sofaW = 210, sofaH = 84, gap = 30;
    const s = Math.min(cw / Math.max(sofaW + 150, it.w + 90), (wallH - 20) / (sofaH + gap + it.h + 10));
    const pw = it.w * s, ph = it.h * s, sw = sofaW * s, sh = sofaH * s, cx = cw / 2 - 40 * s, base = floor;
    wrap.innerHTML = `
      <div class="absolute inset-x-0 bottom-0" style="height:${floor}px;background:linear-gradient(#a98e6c,#7d6548)"></div>
      <div class="absolute inset-x-0" style="bottom:${floor}px;height:6px;background:#f5f0e6"></div>
      <div class="absolute shadow-2xl" style="width:${pw}px;left:${cx - pw / 2}px;bottom:${base + (sofaH + gap) * s}px;box-shadow:0 20px 30px -10px rgba(0,0,0,.45)">${img(it, { cls: 'w-full block', res: 900, eager: true })}</div>
      <div class="absolute" style="left:${cx - sw / 2}px;width:${sw}px;bottom:${base - 10}px;height:${sh}px">
        <div class="absolute inset-x-0 bottom-0 rounded-xl" style="height:${sh * .55}px;background:#3f4a46"></div>
        <div class="absolute inset-x-[4%] rounded-t-2xl" style="bottom:${sh * .35}px;height:${sh * .65}px;background:#4d5a55"></div>
        <div class="absolute left-0 bottom-0 rounded-lg" style="width:${sw * .08}px;height:${sh * .7}px;background:#36403c"></div>
        <div class="absolute right-0 bottom-0 rounded-lg" style="width:${sw * .08}px;height:${sh * .7}px;background:#36403c"></div>
      </div>
      <svg class="absolute" style="left:${cx + sw / 2 + 30 * s}px;bottom:${base - 6}px;height:${175 * s}px" viewBox="0 0 40 175" fill="#14110f" fill-opacity=".75"><circle cx="20" cy="12" r="11"/><path d="M8 28h24l5 70-6 2-3 60h-9l-1-45-1 45h-9l-3-60-6-2z"/></svg>
      <p class="absolute left-4 bottom-3 eyebrow text-ink/60">Shown at true scale · ${dims(it)} · figure 175 cm</p>`;
    Art.hydrate(wrap);
  }

  /* ---------- init ---------- */
  function init({ active = '', dark = false } = {}) {
    if (window.Motion) Motion.init();
    setTimeout(() => document.documentElement.classList.add('ready'), 3000);
    $('#site-header').innerHTML = header(active, dark);
    $('#site-footer').innerHTML = footer();
    lightboxShell();
    const hdr = $('#hdr');
    const onScroll = () => {
      const sc = scrollY > 30;
      hdr.classList.toggle('bg-paper/85', sc); hdr.classList.toggle('backdrop-blur-md', sc); hdr.classList.toggle('shadow-[0_1px_0_rgba(20,17,15,.08)]', sc);
      if (dark) { hdr.classList.toggle('text-paper', !sc); hdr.classList.toggle('text-ink', sc); }
    };
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
    $('#menu-btn').onclick = () => { $('#menu').classList.remove('hidden'); $('#menu').classList.add('flex'); };
    $('#menu-x').onclick = () => { $('#menu').classList.add('hidden'); $('#menu').classList.remove('flex'); };
    refresh();
  }

  window.Site = { init, refresh, img, esc, money, dims, toast, exhibitions, allWorks, status, range, fmt, stored, saveStored, openLightbox: openLb, byId, LS };
})();
