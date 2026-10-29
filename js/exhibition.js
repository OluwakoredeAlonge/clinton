(function () {
  const { img, esc } = Site, $ = s => document.querySelector(s);
  Site.init({ active: 'exhibitions.html', dark: true });

  const params = new URLSearchParams(location.search), exs = Site.exhibitions({ drafts: true });
  const ex = exs.find(e => e.id === params.get('id')) || exs.find(e => Site.status(e).key === 'current') || exs[0];
  const st = Site.status(ex), year = new Date(ex.start + 'T12:00:00').getFullYear();
  document.title = `${ex.title} — Clinton Vane`;
  const accent = ex.accent || '#c9411b';
  const pad = n => String(n).padStart(2, '0');
  const inst = (ex.installation || []).map(x => Array.isArray(x) ? { title: x[0], seed: x[1], style: x[2], pal: x[3] } : { title: x.caption, image: x.image, seed: 'u-' + x.caption, style: 'abstract', pal: 'ember' });
  const sold = w => ['Sold', 'Private collection'].includes(w.status);

  $('#app').innerHTML = `
  <!-- HERO -->
  <section class="relative min-h-[92vh] bg-hall text-paper flex items-end overflow-hidden">
    ${img({ ...ex.cover, title: ex.title }, { ratio: 16 / 9, cls: 'absolute inset-0 w-full h-full object-cover opacity-80', res: 1280, eager: true })}
    <div class="absolute inset-0 bg-gradient-to-t from-hall via-hall/40 to-hall/30"></div>
    <div class="relative max-w-[1500px] w-full mx-auto px-5 md:px-10 pb-14 md:pb-20 pt-40">
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <span class="px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[.16em] flex items-center gap-2" style="background:${accent};color:#14110f">${st.key === 'current' ? '<span class="w-1.5 h-1.5 rounded-full bg-hall animate-pulse"></span>' : ''}${st.label}</span>
        <span class="eyebrow text-paper/70">Solo exhibition № ${ex.edition || '—'} · ${year}</span>
      </div>
      <h1 class="display text-[clamp(4.2rem,13vw,13rem)] leading-[.84] mb-8">${esc(ex.title)}</h1>
      <div class="flex flex-wrap items-end justify-between gap-8">
        <p class="max-w-lg text-lg text-paper/80">${esc(ex.subtitle)}</p>
        <div class="flex flex-wrap gap-4">
          <a href="#hall" class="btn btn-light">Walk the show <i data-lucide="footprints" class="w-4 h-4"></i></a>
          <a href="#visit" class="btn btn-line text-paper hover:!bg-paper hover:!text-ink">Plan a visit</a>
        </div>
      </div>
    </div>
  </section>

  <!-- INFO STRIP -->
  <section class="bg-hall text-paper border-t border-paper/10">
    <div class="max-w-[1500px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-paper/10">
      ${[['calendar', 'Dates', Site.range(ex)], ['map-pin', 'Venue', `${esc(ex.venue)}<br><span class="text-paper/50">${esc(ex.city)}</span>`], ['layout-grid', 'The show', `${ex.works.length} works · ${ex.rooms.length} room${ex.rooms.length > 1 ? 's' : ''}`], ['user-round', 'Curator', esc(ex.curator || '—')]]
        .map(([ic, l, v]) => `<div class="p-5 md:p-8"><p class="eyebrow text-paper/50 flex items-center gap-2 mb-3"><i data-lucide="${ic}" class="w-3.5 h-3.5" style="color:${accent}"></i>${l}</p><p class="text-sm md:text-base leading-snug">${v}</p></div>`).join('')}
    </div>
  </section>

  <!-- THE HALL -->
  <section id="hall" class="bg-hall text-paper pt-10 pb-16 scroll-mt-16">
    <div class="max-w-[1500px] mx-auto px-5 md:px-10 flex flex-wrap items-end justify-between gap-5 mb-6">
      <div><p class="eyebrow mb-2" style="color:${accent}">Walk-through</p><h2 class="display text-5xl md:text-7xl leading-none">The <em>Hall</em></h2></div>
      <div class="flex flex-wrap items-center gap-3 text-paper/60 text-xs">
        <span class="hidden md:flex items-center gap-2"><i data-lucide="mouse" class="w-4 h-4"></i>Scroll or drag</span>
        <span class="hidden md:flex items-center gap-2"><i data-lucide="keyboard" class="w-4 h-4"></i>← →</span>
        <span class="hidden md:flex items-center gap-2"><i data-lucide="ruler" class="w-4 h-4"></i>Works at true relative scale</span>
        <button id="h-prev" class="p-3 rounded-full border border-paper/20 hover:bg-paper hover:text-ink transition" aria-label="Previous room"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
        <button id="h-next" class="p-3 rounded-full border border-paper/20 hover:bg-paper hover:text-ink transition" aria-label="Next room"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
        <button id="h-full" class="p-3 rounded-full border border-paper/20 hover:bg-paper hover:text-ink transition" aria-label="Fullscreen"><i data-lucide="maximize" class="w-4 h-4"></i></button>
      </div>
    </div>
    <div id="hallView" class="hall-view relative overflow-x-auto overflow-y-hidden no-scrollbar select-none border-y border-paper/10"><div id="track" class="relative flex h-full w-max"></div></div>
    <div class="max-w-[1500px] mx-auto px-5 md:px-10 mt-5">
      <div id="mini" class="relative flex gap-1 h-9 cursor-pointer"></div>
    </div>
  </section>

  <!-- STATEMENT -->
  <section class="bg-paper py-24 md:py-36">
    <div class="max-w-[1500px] mx-auto px-5 md:px-10 grid lg:grid-cols-12 gap-14">
      <div class="lg:col-span-4 reveal"><p class="eyebrow text-smoke mb-3">Artist's statement</p>
        <p class="display text-4xl md:text-5xl leading-[1.02]" style="color:${accent === '#c9411b' ? '#c9411b' : '#14110f'}">&ldquo;${esc(ex.pull || ex.subtitle)}&rdquo;</p></div>
      <div class="lg:col-span-7 lg:col-start-6 space-y-6 text-lg leading-relaxed text-ink/80 reveal">
        ${(ex.statement || []).map((p, i) => `<p class="${i === 0 ? 'first-letter:display first-letter:text-8xl first-letter:float-left first-letter:leading-[.8] first-letter:pr-3 first-letter:pt-2 first-letter:text-ember' : ''}">${esc(p)}</p>`).join('')}
        <p class="eyebrow text-smoke pt-4">Clinton Vane · ${year}</p>
      </div>
    </div>
  </section>

  <!-- ROOMS -->
  <section class="bg-bone py-24">
    <div class="max-w-[1500px] mx-auto px-5 md:px-10">
      <div class="reveal mb-14"><p class="eyebrow text-smoke mb-3">Room by room</p><h2 class="display text-5xl md:text-7xl leading-none">The <em>works</em></h2></div>
      <div class="space-y-20">
        ${ex.rooms.map(r => `
          <div class="reveal">
            <div class="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-ink/20 pb-4 mb-8">
              <span class="display text-6xl text-ink/25">${pad(r.n)}</span><h3 class="display text-4xl md:text-5xl">${esc(r.name)}</h3><p class="text-smoke flex-1 min-w-[200px]">${esc(r.text || '')}</p></div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 items-end">
              ${r.works.map(w => `<figure data-w="${ex.works.indexOf(w)}" class="group cursor-zoom-in">
                <div class="overflow-hidden bg-paper p-0">${img(w, { cls: 'w-full block transition duration-700 group-hover:scale-105', res: 520 })}</div>
                <figcaption class="mt-3"><p class="display text-2xl leading-tight">${esc(w.title)}</p><p class="eyebrow text-[10px] text-smoke mt-1">${esc(w.medium)} · ${Site.dims(w)}</p>
                <p class="eyebrow text-[10px] mt-1 ${sold(w) ? 'text-ember' : 'text-emerald-700'}">${esc(w.status)}${w.price && !sold(w) ? ' · ' + Site.money(w.price) : ''}</p></figcaption></figure>`).join('')}
            </div></div>`).join('')}
      </div>
    </div>
  </section>

  <!-- INSTALLATION VIEWS -->
  ${inst.length ? `<section class="bg-paper py-24"><div class="max-w-[1500px] mx-auto px-5 md:px-10">
    <div class="reveal mb-12 flex items-end justify-between flex-wrap gap-4"><div><p class="eyebrow text-smoke mb-3">On the day</p><h2 class="display text-5xl md:text-7xl leading-none">Installation <em>views</em></h2></div><p class="eyebrow text-smoke">${inst.length} photograph${inst.length > 1 ? 's' : ''}</p></div>
    <div class="grid md:grid-cols-6 gap-4 md:gap-6">
      ${inst.map((v, i) => `<figure class="reveal group overflow-hidden relative ${i === 0 ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2'}">
        ${img(v, { ratio: i === 0 ? 4 / 3 : 3 / 2, cls: 'w-full h-full object-cover block transition duration-[1200ms] group-hover:scale-105', res: i === 0 ? 1000 : 640 })}
        <figcaption class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-paper eyebrow">${esc(v.title)}</figcaption></figure>`).join('')}
    </div></div></section>` : ''}

  <!-- PRESS -->
  ${(ex.press || []).length ? `<section class="bg-ink text-paper py-24"><div class="max-w-[1500px] mx-auto px-5 md:px-10">
    <p class="eyebrow text-paper/50 mb-10 flex items-center gap-3"><i data-lucide="newspaper" class="w-4 h-4"></i>What they said</p>
    <div class="grid md:grid-cols-${Math.min(ex.press.length, 2)} gap-14">
      ${ex.press.map(([q, s]) => `<blockquote class="reveal"><i data-lucide="quote" class="w-8 h-8 mb-5" style="color:${accent}"></i><p class="display text-4xl md:text-5xl leading-[1.05] mb-6">${esc(q)}</p><footer class="eyebrow text-paper/60">${esc(s)}</footer></blockquote>`).join('')}
    </div></div></section>` : ''}

  <!-- CATALOGUE + FILM + VISIT -->
  <section id="visit" class="bg-bone py-24 scroll-mt-20">
    <div class="max-w-[1500px] mx-auto px-5 md:px-10 grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4 reveal">
        <p class="eyebrow text-smoke mb-6">Catalogue</p>
        <div class="flex gap-8 items-center">
          <div class="book w-40 shrink-0 relative">${img({ ...ex.cover }, { ratio: 3 / 4, cls: 'w-full block', res: 420 })}
            <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-white/10"></div>
            <p class="absolute left-3 bottom-3 right-3 display text-xl leading-none text-paper drop-shadow">${esc(ex.catalogue?.title || ex.title)}</p></div>
          <div><p class="display text-3xl leading-tight mb-2">${esc(ex.catalogue?.title || ex.title)}</p>
            <p class="text-sm text-smoke mb-4">${ex.catalogue?.pages || '—'} pages · hardback</p>
            <p class="display text-3xl mb-4">${ex.catalogue?.price ? Site.money(ex.catalogue.price) : ''}</p>
            <button onclick="Site.toast('Catalogue reserved (demo).')" class="btn btn-ink !py-3 !px-5"><i data-lucide="book-open" class="w-4 h-4"></i>Reserve</button></div>
        </div>
      </div>
      <div class="lg:col-span-4 reveal">
        <p class="eyebrow text-smoke mb-6">The film</p>
        <button class="relative block w-full group overflow-hidden" onclick="Site.toast('Video player goes here.')">${img({ ...ex.cover }, { ratio: 16 / 10, cls: 'w-full block transition duration-1000 group-hover:scale-105', res: 640 })}
          <span class="absolute inset-0 bg-ink/40 flex items-center justify-center"><span class="w-20 h-20 rounded-full bg-paper text-ink flex items-center justify-center group-hover:scale-110 transition"><i data-lucide="play" class="w-7 h-7 ml-1"></i></span></span></button>
        <p class="text-sm text-smoke mt-3">A short film from the studio and the install.</p>
      </div>
      <div class="lg:col-span-4 reveal">
        <p class="eyebrow text-smoke mb-6">Visit</p>
        <div class="relative h-40 mb-5 overflow-hidden bg-paper border border-ink/10" style="background-image:linear-gradient(rgba(20,17,15,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(20,17,15,.08) 1px,transparent 1px);background-size:28px 28px">
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ember"><i data-lucide="map-pin" class="w-9 h-9"></i></div></div>
        <ul class="space-y-3 text-sm">
          <li class="flex gap-3"><i data-lucide="map-pin" class="w-4 h-4 mt-0.5 text-ember"></i><span>${esc(ex.venue)}<br>${esc(ex.address || '')}, ${esc(ex.city)}</span></li>
          <li class="flex gap-3"><i data-lucide="clock" class="w-4 h-4 mt-0.5 text-ember"></i>${esc(ex.hours || 'See venue')}</li>
          <li class="flex gap-3"><i data-lucide="ticket" class="w-4 h-4 mt-0.5 text-ember"></i>${esc(ex.tickets || 'Free entry')}</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- PREV / NEXT -->
  <section class="bg-hall text-paper"><div class="max-w-[1500px] mx-auto grid md:grid-cols-2" id="pn"></div></section>`;

  // prev / next exhibitions
  const ordered = exs.filter(e => !e.draft), idx = ordered.findIndex(e => e.id === ex.id);
  const cell = (e, dir) => !e ? '<div></div>' : `<a href="exhibition.html?id=${e.id}" class="group relative block overflow-hidden p-10 md:p-16 ${dir === 'next' ? 'md:text-right border-l border-paper/10' : ''}">
    <div class="absolute inset-0 opacity-0 group-hover:opacity-30 transition duration-700">${img({ ...e.cover }, { ratio: 16 / 9, cls: 'w-full h-full object-cover', res: 640 })}</div>
    <p class="relative eyebrow text-paper/50 mb-3 flex items-center gap-2 ${dir === 'next' ? 'md:justify-end' : ''}">${dir === 'prev' ? '<i data-lucide="arrow-left" class="w-4 h-4"></i>Earlier' : 'Later<i data-lucide="arrow-right" class="w-4 h-4"></i>'}</p>
    <p class="relative display text-5xl md:text-6xl leading-none">${esc(e.title)}</p><p class="relative eyebrow text-paper/50 mt-3">${new Date(e.start + 'T12:00:00').getFullYear()}</p></a>`;
  $('#pn').innerHTML = idx < 0 ? '' : cell(ordered[idx + 1], 'prev') + cell(ordered[idx - 1], 'next');

  $('#app').addEventListener('click', e => { const f = e.target.closest('[data-w]'); if (f && f.tagName === 'FIGURE') Site.openLightbox(ex.works, +f.dataset.w); });

  /* ================= THE HALL ================= */
  const view = $('#hallView'), track = $('#track'), hall = $('#hall');
  let target = 0, raf = 0, dragged = false, segs = [], bays = [], hallVisible = false;
  const heroImg = document.querySelector('#app section img'); if (heroImg) heroImg.dataset.parallax = '.18';
  const person = (h, left) => `<svg class="absolute" style="left:${left}px;bottom:${view.dataset.floor - 4}px;height:${h}px;opacity:.42" viewBox="0 0 40 175" fill="#f3eee5"><circle cx="20" cy="12" r="11"/><path d="M8 28h24l5 70-6 2-3 60h-9l-1-45-1 45h-9l-3-60-6-2z"/></svg>`;

  function buildHall() {
    const ratio = view.scrollWidth ? view.scrollLeft / (view.scrollWidth - view.clientWidth || 1) : 0;
    const H = view.clientHeight, floorH = Math.round(H * .17), s = (H - floorH) / 330, GAP = 150;
    view.dataset.floor = floorH;
    const floor = `<div class="hall-floor" style="height:${floorH}px"></div>`;
    const wallBg = c => `background:${c};box-shadow:inset 0 90px 90px -70px rgba(0,0,0,.7)`;
    let h = '';
    segs = [];

    h += `<div data-seg="Entrance" class="relative shrink-0 h-full" style="width:${Math.max(innerWidth * .6, 620)}px;${wallBg('#14110f')}">
      <div class="absolute left-[8%]" style="top:${H * .14}px"><p class="eyebrow mb-4" style="color:${accent}">${Site.range(ex)}</p>
      <p class="vinyl" style="font-size:${Math.min(H * .22, 150)}px;max-width:${Math.max(innerWidth * .5, 560)}px">${esc(ex.title)}</p>
      <p class="mt-6 text-paper/60 max-w-sm text-sm">${esc(ex.venue)} · ${ex.works.length} works · ${ex.rooms.length} room${ex.rooms.length > 1 ? 's' : ''}</p>
      <p class="mt-8 eyebrow text-paper/50 flex items-center gap-3">Begin walking <i data-lucide="move-right" class="w-5 h-5 animate-pulse"></i></p></div>
      ${floor}${person(175 * s, Math.max(innerWidth * .5, 540))}</div>`;

    ex.rooms.forEach(r => {
      h += `<div data-seg="${esc(r.name)}" class="relative shrink-0 h-full flex" style="${wallBg(r.wall || '#1b1512')};border-left:1px solid rgba(255,255,255,.07)">
        <div class="relative shrink-0 h-full" style="width:460px">
          <div class="absolute left-12 right-6" style="top:${H * .2}px"><p class="eyebrow mb-3" style="color:${accent}">Room ${pad(r.n)}</p>
          <p class="vinyl" style="font-size:${Math.min(H * .13, 96)}px">${esc(r.name)}</p><p class="mt-5 text-paper/60 text-sm max-w-[280px]">${esc(r.text || '')}</p></div>
          ${floor}${person(175 * s, 330)}</div>
        ${r.works.map(w => {
          const pw = w.w * s, bottom = Math.max(floorH + 24 * s, floorH + (155 - w.h / 2) * s), n = ex.works.indexOf(w);
          return `<div data-bay class="relative shrink-0 h-full" style="width:${pw + GAP}px">
            <div class="hall-spot" style="width:${pw * 2.6 + 160}px"></div><div class="hall-fixture"></div>
            <div class="absolute" style="left:${GAP / 2}px;bottom:${bottom}px;width:${pw}px">
              <div data-hw="${n}" class="hall-frame">${img(w, { cls: 'w-full block', res: Math.min(1100, Math.max(520, Math.round(pw * 1.6))), eager: true })}</div></div>
            <div class="placard absolute p-2.5 leading-snug" style="left:${GAP / 2 + pw + 12}px;bottom:${floorH + 100 * s}px;width:104px;font-size:10px">
              <p class="font-display italic" style="font-family:'Instrument Serif';font-size:14px;line-height:1.05">${esc(w.title)}</p>
              <p class="text-ink/60 mt-1">${esc(w.year)}</p><p class="text-ink/60">${esc(w.medium)}</p><p class="text-ink/60">${Site.dims(w)}</p>
              <p class="mt-1.5 font-mono uppercase tracking-wider" style="font-size:8px;color:${sold(w) ? '#c9411b' : '#047857'}">${esc(w.status)}</p></div>
            ${floor}</div>`;
        }).join('')}
        <div class="relative shrink-0 h-full" style="width:120px">${floor}</div></div>`;
    });

    h += `<div data-seg="Exit" class="relative shrink-0 h-full" style="width:${Math.max(innerWidth * .55, 560)}px;${wallBg('#14110f')};border-left:1px solid rgba(255,255,255,.07)">
      <div class="absolute left-[10%]" style="top:${H * .2}px"><p class="eyebrow mb-4" style="color:${accent}">End of exhibition</p>
      <p class="vinyl" style="font-size:${Math.min(H * .16, 110)}px">Thank you<br>for walking.</p>
      <div class="mt-8 flex flex-wrap gap-3"><a href="contact.html" class="btn btn-light !py-3 !px-5">Enquire about a work</a><button id="h-restart" class="btn btn-line text-paper !py-3 !px-5"><i data-lucide="rotate-ccw" class="w-4 h-4"></i>Again</button></div></div>${floor}</div>`;

    track.innerHTML = h;
    Site.refresh(track);
    const tl = track.getBoundingClientRect().left;
    bays = [...track.querySelectorAll('[data-bay]')].map(el => { const r = el.getBoundingClientRect(); return { el, cx: r.left - tl + r.width / 2 }; });

    // minimap
    const segEls = [...track.querySelectorAll('[data-seg]')];
    segs = segEls.map(el => ({ el, name: el.dataset.seg }));
    const total = track.scrollWidth;
    $('#mini').innerHTML = segs.map((sg, i) => `<button data-s="${i}" class="relative h-full bg-paper/10 hover:bg-paper/20 transition text-left px-3 overflow-hidden" style="width:${sg.el.offsetWidth / total * 100}%"><span class="eyebrow text-paper/60 text-[9px] whitespace-nowrap">${esc(sg.name)}</span></button>`).join('') +
      `<div id="thumb" class="absolute top-0 bottom-0 pointer-events-none border-2 rounded-sm" style="border-color:${accent};left:0"></div>`;
    $('#mini').style.gap = '0';
    view.scrollLeft = ratio * (view.scrollWidth - view.clientWidth); target = view.scrollLeft; updateThumb();
  }

  // spotlights brighten as you walk up to a painting
  function updateLit() {
    const mid = view.scrollLeft + view.clientWidth / 2, span = view.clientWidth * .55;
    bays.forEach(b => b.el.style.setProperty('--lit', Math.max(.12, 1 - Math.pow(Math.abs(b.cx - mid) / span, 1.3)).toFixed(3)));
  }

  function updateThumb() {
    updateLit();
    const t = $('#thumb'); if (!t) return;
    const m = $('#mini'), total = view.scrollWidth;
    t.style.width = (view.clientWidth / total * 100) + '%'; t.style.left = (view.scrollLeft / total * 100) + '%';
  }
  const max = () => view.scrollWidth - view.clientWidth;
  function go(x) { target = Math.max(0, Math.min(max(), x)); if (!raf) raf = requestAnimationFrame(loop); }
  function loop() { const d = target - view.scrollLeft; if (Math.abs(d) < .6) { view.scrollLeft = target; raf = 0; return; } view.scrollLeft += d * .11; raf = requestAnimationFrame(loop); }
  view.addEventListener('scroll', () => { if (!raf) target = view.scrollLeft; updateThumb(); }, { passive: true });
  view.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if ((d < 0 && target <= 1) || (d > 0 && target >= max() - 1)) return;
    e.preventDefault(); go(target + d * 1.3);
  }, { passive: false });

  let sx = 0, sl = 0, down = false;
  view.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; dragged = false; sx = e.clientX; sl = view.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { dragged = true; view.classList.add('dragging'); } if (dragged) { if (raf) { cancelAnimationFrame(raf); raf = 0; } view.scrollLeft = sl - dx; target = view.scrollLeft; } });
  addEventListener('pointerup', () => { down = false; view.classList.remove('dragging'); setTimeout(() => dragged = false, 0); });
  view.addEventListener('click', e => { if (dragged) return; const f = e.target.closest('[data-hw]'); if (f) Site.openLightbox(ex.works, +f.dataset.hw); });

  const hop = dir => {
    const xs = segs.map(s => s.el.offsetLeft), cur = view.scrollLeft;
    go(dir > 0 ? (xs.find(x => x > cur + 40) ?? max()) : ([...xs].reverse().find(x => x < cur - 40) ?? 0));
  };
  $('#h-next').onclick = () => hop(1); $('#h-prev').onclick = () => hop(-1);
  $('#mini').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) go(segs[+b.dataset.s].el.offsetLeft); });
  track.addEventListener('click', e => { if (e.target.closest('#h-restart')) go(0); });
  $('#h-full').onclick = () => document.fullscreenElement ? document.exitFullscreen() : hall.requestFullscreen?.();
  document.addEventListener('fullscreenchange', () => setTimeout(buildHall, 120));
  new IntersectionObserver(es => hallVisible = es[0].isIntersecting, { threshold: .4 }).observe(hall);
  document.addEventListener('keydown', e => {
    if (!hallVisible || !$('#lb').classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(target + view.clientWidth * .35); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(target - view.clientWidth * .35); }
  });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildHall, 250); });

  buildHall();
  Site.refresh();
  if (location.hash === '#hall') setTimeout(() => hall.scrollIntoView(), 50);
})();
