(function () {
  const { img, esc } = Site, $ = s => document.querySelector(s);
  Site.init({ active: 'exhibitions.html' });
  const exs = Site.exhibitions();
  const feat = exs.find(e => ['current', 'upcoming'].includes(Site.status(e).key)) || exs[0];
  const st = Site.status(feat);

  $('#featured').innerHTML = `
    <div class="max-w-[1500px] mx-auto px-5 md:px-10">
      <a href="exhibition.html?id=${feat.id}" class="group grid lg:grid-cols-12 gap-0 bg-hall text-paper overflow-hidden reveal">
        <div class="lg:col-span-8 overflow-hidden relative">
          ${img({ ...feat.cover, title: feat.title }, { ratio: 16 / 10, cls: 'w-full block transition duration-[1600ms] group-hover:scale-105', res: 1200, eager: true })}
          <span class="absolute top-5 left-5 bg-ember text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[.16em] flex items-center gap-2">${st.key === 'current' ? '<span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>' : ''}${st.key === 'past' ? 'Latest' : st.label}</span>
        </div>
        <div class="lg:col-span-4 p-8 md:p-12 flex flex-col justify-between gap-10">
          <div>
            <p class="eyebrow text-paper/50 mb-5">Solo exhibition № ${feat.edition} · ${new Date(feat.start).getFullYear()}</p>
            <h2 class="display text-6xl md:text-7xl leading-[.9] mb-5">${esc(feat.title)}</h2>
            <p class="text-paper/70">${esc(feat.subtitle)}</p>
          </div>
          <div>
            <ul class="text-sm space-y-2 text-paper/80 mb-8">
              <li class="flex gap-3"><i data-lucide="calendar" class="w-4 h-4 text-ember mt-0.5"></i>${Site.range(feat)}</li>
              <li class="flex gap-3"><i data-lucide="map-pin" class="w-4 h-4 text-ember mt-0.5"></i>${esc(feat.venue)}</li>
              ${st.note ? `<li class="flex gap-3"><i data-lucide="hourglass" class="w-4 h-4 text-ember mt-0.5"></i>${st.note}</li>` : ''}
            </ul>
            <span class="btn btn-light group-hover:!bg-ember group-hover:!text-white">Walk the show <i data-lucide="footprints" class="w-4 h-4"></i></span>
          </div>
        </div>
      </a>
    </div>`;

  // archive rows + sticky hover preview
  $('#rows').innerHTML = exs.map((e, i) => {
    const s = Site.status(e), y = new Date(e.start + 'T12:00:00').getFullYear();
    return `<li><a href="exhibition.html?id=${e.id}" data-i="${i}" class="group grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 py-7 border-b border-paper/15 transition-all hover:pl-4">
      <span class="display text-6xl md:text-8xl leading-none text-paper/25 group-hover:text-ember transition">${y}</span>
      <span><span class="display text-3xl md:text-5xl leading-none block mb-2">${esc(e.title)}</span>
        <span class="eyebrow text-paper/50 block">${esc(e.venue)} · ${e.works.length} works · ${e.rooms.length} room${e.rooms.length > 1 ? 's' : ''}${e.user ? ' · uploaded' : ''}</span></span>
      <span class="flex items-center gap-3">${s.key === 'current' ? '<span class="eyebrow text-ember hidden sm:block">Now</span>' : ''}<i data-lucide="arrow-up-right" class="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:rotate-45 transition"></i></span>
    </a></li>`;
  }).join('');

  $('#preview').innerHTML = `<div class="relative aspect-[4/5] overflow-hidden bg-hall">${exs.map((e, i) =>
    `<div data-p="${i}" class="absolute inset-0 transition-all duration-700 ${i ? 'opacity-0 scale-105' : ''}">${img({ ...e.cover, title: e.title }, { ratio: 4 / 5, cls: 'w-full h-full object-cover', res: 720 })}
      <div class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent"><p class="eyebrow text-paper/70">${Site.range(e)}</p><p class="display text-3xl">${esc(e.title)}</p></div></div>`).join('')}</div>`;
  const panes = [...document.querySelectorAll('[data-p]')];
  $('#rows').addEventListener('mouseover', e => {
    const a = e.target.closest('a'); if (!a) return;
    panes.forEach((p, i) => { const on = i === +a.dataset.i; p.classList.toggle('opacity-0', !on); p.classList.toggle('scale-105', !on); });
  });

  // stats
  const totalWorks = exs.reduce((n, e) => n + e.works.length, 0), visitors = exs.reduce((n, e) => n + (e.stats?.visitors || 0), 0);
  $('#stats').innerHTML = [[exs.length, 'Solo exhibitions'], [totalWorks, 'Works exhibited'], [visitors.toLocaleString(), 'Visitors, and counting'], [new Date().getFullYear() - new Date(exs[exs.length - 1].start).getFullYear(), 'Years on the wall']]
    .map(([n, l]) => `<div class="reveal"><p class="display text-7xl md:text-8xl leading-none">${n}</p><p class="eyebrow text-smoke mt-3">${l}</p></div>`).join('');

  Site.refresh();
})();
