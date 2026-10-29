(function () {
  const { WORKS } = SITE, { img, esc } = Site, $ = s => document.querySelector(s);
  const works = Site.allWorks();
  Site.init({ active: 'index.html' });

  // hero collage
  const c = [['w1', 'left-0 top-0 w-[58%] -rotate-2', 'z-10', .05, 14], ['w5', 'right-0 top-[12%] w-[44%] rotate-3', 'z-20', -.07, -22], ['w14', 'left-[16%] bottom-0 w-[46%] rotate-1', 'z-30', .12, 30]];
  $('#collage').innerHTML = c.map(([id, pos, z, sp, dp], i) => {
    const w = Site.byId[id];
    return `<figure data-parallax="${sp}" data-depth="${dp}" class="absolute ${pos} ${z} shadow-[0_30px_50px_-20px_rgba(20,17,15,.55)] bg-paper p-1.5 md:p-2" style="animation:rise 1.3s cubic-bezier(.2,.7,.2,1) ${.9 + i * .18}s backwards">
      ${img(w, { cls: 'w-full block', eager: true, res: 720 })}
      <figcaption class="eyebrow text-smoke text-[9px] mt-1.5">Fig. 0${i + 1} — ${esc(w.title)}, ${w.year}</figcaption></figure>`;
  }).join('');

  // marquee
  const words = ['Landscape', 'Portrait', 'Seascape', 'Abstract', 'Still life', 'Figurative', 'City', 'Oil', 'Acrylic', 'Watercolour', 'Ink'];
  const row = words.map(w => `<span class="px-6 flex items-center gap-12">${w}<i data-lucide="asterisk" class="w-6 h-6 text-ember"></i></span>`).join('');
  $('#marquee').innerHTML = row + row;

  // selected works
  const sel = works.filter(w => w.year >= 2025).slice(0, 10);
  $('#selected').innerHTML = sel.map((w, i) => {
    const h = 300 + (i % 3) * 70, wd = Math.round(h * w.w / w.h);
    return `<figure data-i="${i}" class="snap-start shrink-0 group cursor-zoom-in" style="width:${Math.min(wd, 520)}px;max-width:82vw">
      ${img(w, { cls: 'w-full block shadow-[0_24px_40px_-24px_rgba(20,17,15,.5)] transition duration-700 group-hover:-translate-y-2', res: 720 })}
      <figcaption class="mt-4 flex justify-between gap-3"><span class="display text-2xl leading-tight">${esc(w.title)}</span><span class="eyebrow text-smoke mt-2">${w.year}</span></figcaption>
      <p class="eyebrow text-smoke mt-1">${esc(w.medium)} · ${Site.dims(w)}</p></figure>`;
  }).join('');
  $('#selected').addEventListener('click', e => { const f = e.target.closest('figure'); if (f) Site.openLightbox(sel, +f.dataset.i); });
  const scroller = $('#selected');
  $('#sel-prev').onclick = () => scroller.scrollBy({ left: -scroller.clientWidth * .6, behavior: 'smooth' });
  $('#sel-next').onclick = () => scroller.scrollBy({ left: scroller.clientWidth * .6, behavior: 'smooth' });

  // now showing / next exhibition
  const exs = Site.exhibitions();
  const ex = exs.find(e => ['current', 'upcoming'].includes(Site.status(e).key)) || exs[0], st = Site.status(ex);
  $('#showing').innerHTML = `
    <div class="max-w-[1500px] mx-auto px-5 md:px-10 py-24 md:py-32 grid lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 reveal">
        <p class="eyebrow flex items-center gap-3 mb-6 ${st.key === 'past' ? 'text-paper/60' : 'text-ember'}">${st.key !== 'past' ? '<span class="w-2 h-2 rounded-full bg-ember animate-pulse"></span>' : ''}${st.key === 'past' ? 'Latest exhibition' : st.label}${st.note ? ' · ' + st.note : ''}</p>
        <h2 class="display text-6xl md:text-8xl leading-[.9] mb-6">${esc(ex.title)}</h2>
        <p class="text-paper/70 text-lg max-w-md mb-8">${esc(ex.subtitle)}</p>
        <dl class="text-sm space-y-3 mb-10 text-paper/80">
          <div class="flex items-center gap-3"><i data-lucide="calendar" class="w-4 h-4 text-ember"></i>${Site.range(ex)}</div>
          <div class="flex items-center gap-3"><i data-lucide="map-pin" class="w-4 h-4 text-ember"></i>${esc(ex.venue)}, ${esc(ex.city)}</div>
          <div class="flex items-center gap-3"><i data-lucide="layout-grid" class="w-4 h-4 text-ember"></i>${ex.works.length} works across ${ex.rooms.length} rooms</div>
        </dl>
        <div class="flex flex-wrap gap-4">
          <a href="exhibition.html?id=${ex.id}#hall" class="btn btn-light">Walk the show <i data-lucide="footprints" class="w-4 h-4"></i></a>
          <a href="exhibitions.html" class="btn btn-line text-paper hover:!bg-paper hover:!text-ink">All exhibitions</a>
        </div>
      </div>
      <a href="exhibition.html?id=${ex.id}" class="lg:col-span-7 reveal block relative group overflow-hidden">
        ${img({ ...ex.cover, title: ex.title }, { ratio: 4 / 3, cls: 'w-full block transition duration-[1400ms] group-hover:scale-105', res: 1100 })}
        <span class="absolute bottom-5 right-5 bg-paper text-ink rounded-full px-5 py-3 text-[12px] uppercase tracking-[.15em] flex items-center gap-2">Enter <i data-lucide="arrow-up-right" class="w-4 h-4"></i></span>
      </a>
    </div>`;

  // subjects with cursor-following preview
  const cats = [...new Set(works.map(w => w.cat))];
  $('#subjects').innerHTML = cats.map((cat, i) => {
    const n = works.filter(w => w.cat === cat).length;
    return `<li><a href="gallery.html?cat=${encodeURIComponent(cat)}" data-cat="${cat}" class="group flex items-center gap-6 py-6 md:py-8 border-b border-ink/15 transition-all hover:px-4 hover:bg-ink hover:text-paper">
      <span class="eyebrow w-8 text-smoke group-hover:text-paper/60">0${i + 1}</span>
      <span class="display text-5xl md:text-8xl leading-none flex-1">${cat}</span>
      <span class="eyebrow text-smoke group-hover:text-paper/60">${n} works</span>
      <i data-lucide="arrow-up-right" class="w-6 h-6 opacity-0 group-hover:opacity-100 transition"></i></a></li>`;
  }).join('');
  const follow = document.createElement('div');
  follow.className = 'fixed z-40 pointer-events-none w-56 shadow-2xl opacity-0 transition-opacity duration-300 hidden md:block';
  document.body.appendChild(follow);
  let fx = 0, fy = 0, tx = 0, ty = 0, on = false;
  const tick = () => { fx += (tx - fx) * .14; fy += (ty - fy) * .14; follow.style.transform = `translate(${fx + 30}px,${fy - 90}px) rotate(${(tx - fx) * .04}deg)`; requestAnimationFrame(tick); }; tick();
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; if (!on) { fx = tx; fy = ty; } });
  $('#subjects').addEventListener('mouseover', e => {
    const a = e.target.closest('a'); if (!a) return;
    const pool = works.filter(w => w.cat === a.dataset.cat), w = pool[Math.floor(Math.random() * pool.length)];
    follow.innerHTML = img(w, { cls: 'w-full block', res: 420, eager: true }); Site.refresh(follow); follow.style.opacity = 1; on = true;
  });
  $('#subjects').addEventListener('mouseleave', () => { follow.style.opacity = 0; on = false; });

  // about
  $('#about-img').innerHTML = img({ seed: 'artist-portrait', style: 'portrait', pal: 'clay', title: 'Portrait of the artist' }, { ratio: 4 / 5, cls: 'w-full block shadow-2xl', res: 800 });
  const ne = exs.length, nw = works.length;
  const stats = [[new Date().getFullYear() - 2011, 'Years painting full time'], [ne, 'Solo exhibitions'], [nw + '+', 'Works in this archive'], ['22', 'Collections worldwide']];
  $('#counters').innerHTML = stats.map(([n, l]) => `<div><p class="display text-6xl leading-none">${n}</p><p class="eyebrow text-smoke mt-2">${l}</p></div>`).join('');

  Site.refresh();
})();
