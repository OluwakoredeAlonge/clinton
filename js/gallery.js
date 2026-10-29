(function () {
  const { img, esc } = Site, $ = s => document.querySelector(s);
  Site.init({ active: 'gallery.html' });
  const all = Site.allWorks();
  const params = new URLSearchParams(location.search);
  const S = { cat: params.get('cat') || 'All', medium: 'All', avail: false, sort: 'newest', q: '', view: 'masonry' };
  const grp = m => /^oil/i.test(m) ? 'Oil' : /^acrylic/i.test(m) ? 'Acrylic' : /^water/i.test(m) ? 'Watercolour' : /^gouache/i.test(m) ? 'Gouache' : /^ink/i.test(m) ? 'Ink' : /^pastel/i.test(m) ? 'Pastel' : /^charcoal/i.test(m) ? 'Charcoal' : 'Mixed media';
  const cats = ['All', ...new Set(all.map(w => w.cat))];
  const mediums = ['All', ...new Set(all.map(w => grp(w.medium)))];
  const isSold = w => ['Sold', 'Private collection'].includes(w.status);
  let current = [];

  $('#medium').innerHTML = mediums.map(m => `<option value="${m}">${m === 'All' ? 'All media' : m}</option>`).join('');

  function chips() {
    $('#chips').innerHTML = cats.map(c => `<button data-cat="${c}" class="shrink-0 px-4 py-2 rounded-full border text-[12px] uppercase tracking-[.12em] transition ${S.cat === c ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'}">${c}</button>`).join('');
    document.querySelectorAll('[data-view]').forEach(b => b.className = 'p-2.5 ' + (b.dataset.view === S.view ? 'bg-ink text-paper' : ''));
  }

  function render() {
    let l = all.filter(w => (S.cat === 'All' || w.cat === S.cat) && (S.medium === 'All' || grp(w.medium) === S.medium) && (!S.avail || !isSold(w)) && (!S.q || w.title.toLowerCase().includes(S.q)));
    const sorts = { newest: (a, b) => b.year - a.year, oldest: (a, b) => a.year - b.year, largest: (a, b) => b.w * b.h - a.w * a.h, title: (a, b) => a.title.localeCompare(b.title) };
    l.sort(sorts[S.sort]); current = l;
    $('#count').textContent = `${l.length} work${l.length === 1 ? '' : 's'}${S.cat !== 'All' ? ' · ' + S.cat : ''}`;
    $('#empty').classList.toggle('hidden', l.length > 0);
    const g = $('#grid');
    g.className = S.view === 'masonry' ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8' : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10';
    g.innerHTML = l.map((w, i) => `
      <figure data-i="${i}" class="group ${S.view === 'masonry' ? 'break-inside-avoid mb-10' : ''} cursor-zoom-in">
        <div class="relative overflow-hidden bg-bone ${S.view === 'grid' ? 'aspect-[4/5]' : ''}">
          ${img(w, { cls: `w-full block transition duration-[900ms] group-hover:scale-[1.05] ${S.view === 'grid' ? 'h-full object-cover' : ''}`, res: 560, style: S.view === 'grid' ? 'aspect-ratio:4/5' : '' })}
          <span class="absolute top-3 left-3 flex items-center gap-2 bg-paper/90 backdrop-blur px-3 py-1 rounded-full text-[10px] uppercase tracking-[.14em]"><span class="w-1.5 h-1.5 rounded-full ${isSold(w) ? 'bg-ember' : w.status === 'Reserved' ? 'bg-ochre' : 'bg-emerald-500'}"></span>${esc(w.status)}</span>
          <span class="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-end p-4"><i data-lucide="maximize-2" class="w-5 h-5 text-paper"></i></span>
        </div>
        <figcaption class="mt-3 flex justify-between gap-3">
          <div><h3 class="display text-2xl leading-tight">${esc(w.title)}</h3><p class="eyebrow text-[10px] text-smoke mt-1">${esc(w.medium)} · ${Site.dims(w)}</p></div>
          <span class="eyebrow text-smoke mt-1.5">${w.year}</span></figcaption>
      </figure>`).join('');
    Site.refresh(g);
  }

  $('#chips').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { S.cat = b.dataset.cat; chips(); render(); } });
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { S.view = b.dataset.view; chips(); render(); });
  $('#medium').onchange = e => { S.medium = e.target.value; render(); };
  $('#sort').onchange = e => { S.sort = e.target.value; render(); };
  $('#avail').onchange = e => { S.avail = e.target.checked; render(); };
  $('#q').oninput = e => { S.q = e.target.value.trim().toLowerCase(); render(); };
  $('#grid').addEventListener('click', e => { const f = e.target.closest('figure'); if (f) Site.openLightbox(current, +f.dataset.i); });

  chips(); render();
  const wk = params.get('work'); if (wk) { const i = current.findIndex(w => w.id === wk); if (i >= 0) Site.openLightbox(current, i); }
})();
