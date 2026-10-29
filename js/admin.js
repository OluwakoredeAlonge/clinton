(function () {
  const { esc } = Site, $ = s => document.querySelector(s);
  Site.init({});

  const CATS = ['Landscape', 'Seascape', 'Portrait', 'Figurative', 'Abstract', 'Still life', 'City'];
  const STATUS = ['Available', 'Reserved', 'Sold', 'Private collection', 'On loan', 'Not for sale'];
  const blank = () => ({
    id: 'u-' + Date.now().toString(36), title: '', subtitle: '', edition: '', start: '', end: '', venue: '', city: '', address: '', curator: '', hours: '', tickets: '',
    accent: '#c9411b', cover: null, pull: '', statementText: '',
    rooms: [{ name: 'Room one', text: '', wall: '#1b1512', works: [] }],
    installation: [], press: [], catalogue: { title: '', pages: '', price: '' },
  });
  let state = blank(), lastSaved = null;

  /* ---------- image upload (resized so localStorage survives) ---------- */
  function readImage(file, max = 1200) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => {
        const im = new Image();
        im.onload = () => {
          const k = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas');
          cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          res({ data: cv.toDataURL('image/jpeg', .78), ratio: im.width / im.height, name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') });
        };
        im.onerror = rej; im.src = fr.result;
      };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }

  /* ---------- form ---------- */
  const inp = (label, path, o = {}) => `<label class="block ${o.cls || ''}"><span class="eyebrow text-smoke">${label}</span>
    <input class="field" data-b="${path}" type="${o.type || 'text'}" value="${esc(get(path) ?? '')}" placeholder="${esc(o.ph || '')}" ${o.step ? `step="${o.step}"` : ''}></label>`;
  const get = p => p.split('.').reduce((o, k) => o?.[k], state);
  const set = (p, v) => { const k = p.split('.'); const last = k.pop(); k.reduce((o, x) => o[x], state)[last] = v; };
  const card = (n, title, body, ic) => `<section class="bg-white/40 border border-ink/10 p-6 md:p-8"><h2 class="flex items-center gap-4 mb-6"><span class="display text-5xl text-ember leading-none">${n}</span><span class="display text-3xl">${title}</span><i data-lucide="${ic}" class="w-5 h-5 text-smoke ml-auto"></i></h2>${body}</section>`;
  const drop = (kind, label, multi = true) => `<div data-drop="${kind}" class="drop rounded-sm p-6 text-center cursor-pointer"><i data-lucide="image-up" class="w-6 h-6 mx-auto mb-2 text-smoke"></i><p class="text-sm">${label}</p><p class="eyebrow text-smoke mt-1 text-[10px]">Drag files here or click to browse</p><input type="file" accept="image/*" ${multi ? 'multiple' : ''} class="hidden"></div>`;

  function renderForm() {
    const s = state;
    $('#form').innerHTML =
      card('01', 'The basics', `<div class="grid md:grid-cols-2 gap-x-8 gap-y-5">
        ${inp('Exhibition title *', 'title', { ph: 'e.g. The Weight of Light', cls: 'md:col-span-2' })}
        ${inp('One-line subtitle', 'subtitle', { ph: 'What is the show about?', cls: 'md:col-span-2' })}
        ${inp('Opens *', 'start', { type: 'date' })}${inp('Closes *', 'end', { type: 'date' })}
        ${inp('Edition (solo show №)', 'edition', { type: 'number', ph: '7' })}
        <label class="block"><span class="eyebrow text-smoke">Accent colour</span><input class="block mt-2 h-10 w-24 bg-transparent cursor-pointer" type="color" data-b="accent" value="${s.accent}"></label>
      </div>`, 'type') +
      card('02', 'Venue & visiting', `<div class="grid md:grid-cols-2 gap-x-8 gap-y-5">
        ${inp('Venue', 'venue', { ph: 'Gallery name' })}${inp('City', 'city')}
        ${inp('Address', 'address', { cls: 'md:col-span-2' })}
        ${inp('Curator', 'curator')}${inp('Ticketing', 'tickets', { ph: 'Free entry' })}
        ${inp('Opening hours', 'hours', { ph: 'Tue – Sun, 10:00 – 18:00', cls: 'md:col-span-2' })}
      </div>`, 'map-pin') +
      card('03', 'Cover image', s.cover
        ? `<div class="flex items-center gap-5"><img src="${s.cover}" class="w-48 aspect-[16/10] object-cover" alt=""><button data-act="rm-cover" class="btn btn-line !py-2.5 !px-4"><i data-lucide="trash-2" class="w-4 h-4"></i>Remove</button></div>`
        : drop('cover', 'Upload the hero image (landscape works best)', false), 'image') +
      card('04', 'Statement', `<label class="block mb-6"><span class="eyebrow text-smoke">Pull quote</span><input class="field" data-b="pull" value="${esc(s.pull)}" placeholder="A line to display large"></label>
        <label class="block"><span class="eyebrow text-smoke">Artist's statement (leave a blank line between paragraphs)</span><textarea class="field !border !border-ink/20 mt-2 p-3 h-44" data-b="statementText">${esc(s.statementText)}</textarea></label>`, 'align-left') +
      card('05', 'Rooms & paintings', `<div class="space-y-8">${s.rooms.map((r, ri) => `
        <div class="border border-ink/15 bg-paper/60 p-5">
          <div class="flex items-center gap-4 mb-4"><span class="display text-4xl text-ink/30">${String(ri + 1).padStart(2, '0')}</span>
            <input class="field !text-lg flex-1" data-b="rooms.${ri}.name" value="${esc(r.name)}" placeholder="Room name">
            <label class="flex items-center gap-2 eyebrow text-smoke text-[10px]">Wall<input type="color" data-b="rooms.${ri}.wall" value="${r.wall}" class="h-8 w-10 bg-transparent"></label>
            ${s.rooms.length > 1 ? `<button data-act="rm-room" data-ri="${ri}" class="p-2 text-smoke hover:text-ember" aria-label="Remove room"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}</div>
          <input class="field mb-5" data-b="rooms.${ri}.text" value="${esc(r.text)}" placeholder="One line shown on the wall at the room's entrance">
          <div class="space-y-4 mb-4">${r.works.map((w, wi) => `
            <div class="grid grid-cols-[72px_1fr] gap-4 border-t border-ink/10 pt-4">
              <img src="${w.image}" class="w-[72px] aspect-square object-cover" alt="">
              <div class="grid grid-cols-6 gap-x-4 gap-y-3 items-end">
                <input class="field col-span-4" data-b="rooms.${ri}.works.${wi}.title" value="${esc(w.title)}" placeholder="Title">
                <input class="field col-span-2" type="number" data-b="rooms.${ri}.works.${wi}.year" value="${w.year}" placeholder="Year">
                <input class="field col-span-3" data-b="rooms.${ri}.works.${wi}.medium" value="${esc(w.medium)}" placeholder="Medium">
                <select class="field col-span-3" data-b="rooms.${ri}.works.${wi}.cat">${CATS.map(c => `<option ${c === w.cat ? 'selected' : ''}>${c}</option>`).join('')}</select>
                <input class="field col-span-1" type="number" data-b="rooms.${ri}.works.${wi}.w" value="${w.w}" placeholder="W cm">
                <input class="field col-span-1" type="number" data-b="rooms.${ri}.works.${wi}.h" value="${w.h}" placeholder="H cm">
                <select class="field col-span-2" data-b="rooms.${ri}.works.${wi}.status">${STATUS.map(c => `<option ${c === w.status ? 'selected' : ''}>${c}</option>`).join('')}</select>
                <input class="field col-span-2" type="number" data-b="rooms.${ri}.works.${wi}.price" value="${w.price ?? ''}" placeholder="Price $">
                <input class="field col-span-5" data-b="rooms.${ri}.works.${wi}.desc" value="${esc(w.desc)}" placeholder="A sentence about this painting (optional)">
                <button data-act="rm-work" data-ri="${ri}" data-wi="${wi}" class="p-2 text-smoke hover:text-ember justify-self-end" aria-label="Remove"><i data-lucide="x" class="w-4 h-4"></i></button>
              </div></div>`).join('')}</div>
          ${drop('work:' + ri, 'Add paintings to this room')}</div>`).join('')}
        <button data-act="add-room" class="btn btn-line"><i data-lucide="plus" class="w-4 h-4"></i>Add another room</button></div>`, 'layout-grid') +
      card('06', 'Installation views & opening night', `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">${s.installation.map((v, i) => `
        <div><img src="${v.image}" class="w-full aspect-[3/2] object-cover mb-2" alt=""><div class="flex gap-2"><input class="field !py-1.5 text-sm" data-b="installation.${i}.caption" value="${esc(v.caption)}" placeholder="Caption"><button data-act="rm-inst" data-i="${i}" class="text-smoke hover:text-ember"><i data-lucide="x" class="w-4 h-4"></i></button></div></div>`).join('')}</div>
        ${drop('inst', 'Add photographs from the install and the opening')}`, 'camera') +
      card('07', 'Press & catalogue', `<div class="space-y-4 mb-6">${s.press.map((p, i) => `
        <div class="grid md:grid-cols-[1fr_220px_auto] gap-4 items-end"><input class="field" data-b="press.${i}.quote" value="${esc(p.quote)}" placeholder="Quote"><input class="field" data-b="press.${i}.source" value="${esc(p.source)}" placeholder="Publication">
        <button data-act="rm-press" data-i="${i}" class="p-2 text-smoke hover:text-ember"><i data-lucide="x" class="w-4 h-4"></i></button></div>`).join('')}
        <button data-act="add-press" class="btn btn-line !py-2.5 !px-4"><i data-lucide="plus" class="w-4 h-4"></i>Add a press quote</button></div>
        <div class="grid md:grid-cols-3 gap-x-8 gap-y-5 border-t border-ink/10 pt-6">${inp('Catalogue title', 'catalogue.title')}${inp('Pages', 'catalogue.pages', { type: 'number' })}${inp('Price $', 'catalogue.price', { type: 'number' })}</div>`, 'book-open');
    bindDrops(); Site.refresh($('#form')); preview();
  }

  /* ---------- live preview ---------- */
  function preview() {
    const s = state, nWorks = s.rooms.reduce((n, r) => n + r.works.length, 0);
    const checks = [['Title', !!s.title], ['Dates', !!(s.start && s.end && s.end >= s.start)], ['Cover image', !!s.cover], ['Statement', s.statementText.trim().length > 20], ['At least one painting', nWorks > 0]];
    const done = checks.filter(c => c[1]).length, range = s.start && s.end ? Site.range({ start: s.start, end: s.end }) : 'Dates to be set';
    $('#preview').innerHTML = `
      <div class="bg-hall text-paper overflow-hidden shadow-2xl">
        <div class="relative aspect-[16/10] bg-ink">${s.cover ? `<img src="${s.cover}" class="absolute inset-0 w-full h-full object-cover" alt="">` : `<div class="absolute inset-0 flex items-center justify-center text-paper/30"><i data-lucide="image" class="w-10 h-10"></i></div>`}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div class="absolute bottom-0 p-5"><p class="eyebrow mb-2" style="color:${s.accent}">${esc(range)}</p><p class="display text-4xl leading-[.95]">${esc(s.title) || 'Untitled exhibition'}</p></div></div>
        <div class="p-5 text-sm text-paper/70 flex justify-between"><span>${esc(s.venue) || 'Venue'}</span><span>${nWorks} works · ${s.rooms.length} room${s.rooms.length > 1 ? 's' : ''}</span></div>
      </div>
      <div class="bg-white/40 border border-ink/10 p-5 mt-5"><div class="flex justify-between eyebrow text-smoke mb-3"><span>Ready to publish</span><span>${done}/${checks.length}</span></div>
        <div class="h-1 bg-ink/10 mb-4"><div class="h-full bg-ember transition-all" style="width:${done / checks.length * 100}%"></div></div>
        <ul class="space-y-1.5 text-sm">${checks.map(([l, ok]) => `<li class="flex items-center gap-2 ${ok ? '' : 'text-smoke'}"><i data-lucide="${ok ? 'circle-check' : 'circle'}" class="w-4 h-4 ${ok ? 'text-emerald-600' : ''}"></i>${l}</li>`).join('')}</ul></div>`;
    lucide.createIcons();
    const a = $('#a-open'); if (lastSaved === state.id) { a.href = 'exhibition.html?id=' + state.id; a.classList.remove('hidden'); } else a.classList.add('hidden');
  }

  /* ---------- events ---------- */
  $('#form').addEventListener('input', e => {
    const p = e.target.dataset.b; if (!p) return;
    set(p, e.target.type === 'number' ? (e.target.value === '' ? '' : +e.target.value) : e.target.value); preview();
  });
  $('#form').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const d = b.dataset, a = d.act;
    if (a === 'rm-cover') state.cover = null;
    if (a === 'add-room') state.rooms.push({ name: 'Room ' + (state.rooms.length + 1), text: '', wall: '#1b1512', works: [] });
    if (a === 'rm-room') state.rooms.splice(+d.ri, 1);
    if (a === 'rm-work') state.rooms[+d.ri].works.splice(+d.wi, 1);
    if (a === 'rm-inst') state.installation.splice(+d.i, 1);
    if (a === 'add-press') state.press.push({ quote: '', source: '' });
    if (a === 'rm-press') state.press.splice(+d.i, 1);
    renderForm();
  });

  function bindDrops() {
    document.querySelectorAll('[data-drop]').forEach(z => {
      const input = z.querySelector('input'), kind = z.dataset.drop;
      const handle = async files => {
        const list = [...files].filter(f => f.type.startsWith('image/')); if (!list.length) return;
        for (const f of list) {
          try {
            const im = await readImage(f, kind === 'cover' ? 1600 : 1200);
            if (kind === 'cover') state.cover = im.data;
            else if (kind === 'inst') state.installation.push({ caption: '', image: im.data });
            else { const h = 100; state.rooms[+kind.split(':')[1]].works.push({ title: im.name, year: new Date().getFullYear(), medium: 'Oil on canvas', cat: 'Abstract', w: Math.round(h * im.ratio), h, status: 'Available', price: '', desc: '', image: im.data }); }
          } catch (e) { Site.toast('Could not read ' + f.name); }
        }
        renderForm();
      };
      z.onclick = e => { if (e.target !== input) input.click(); };
      input.onchange = () => handle(input.files);
      ['dragenter', 'dragover'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.remove('over'); }));
      z.addEventListener('drop', e => handle(e.dataTransfer.files));
    });
  }

  /* ---------- save / publish ---------- */
  function toRecord(draft) {
    const s = state;
    return {
      id: s.id, edition: s.edition || '', title: s.title.trim(), subtitle: s.subtitle, start: s.start, end: s.end, venue: s.venue, city: s.city, address: s.address,
      curator: s.curator, hours: s.hours, tickets: s.tickets, accent: s.accent, pull: s.pull, draft,
      statement: s.statementText.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean),
      cover: s.cover ? { image: s.cover } : { seed: s.id, style: 'abstract', pal: 'ember' },
      rooms: s.rooms.map((r, ri) => ({ name: r.name || 'Room ' + (ri + 1), text: r.text, wall: r.wall, works: r.works.map((w, wi) => ({ ...w, id: `${s.id}-r${ri}-w${wi}`, price: w.price === '' ? null : w.price, seed: s.id + wi, style: 'abstract', pal: 'ember', exh: s.id })) })),
      installation: s.installation, press: s.press.filter(p => p.quote).map(p => [p.quote, p.source]),
      catalogue: { title: s.catalogue.title || s.title, pages: s.catalogue.pages, price: s.catalogue.price }, stats: {},
    };
  }
  function save(draft) {
    if (!state.title.trim()) return Site.toast('Give the exhibition a title first.');
    if (!draft && !(state.start && state.end && state.end >= state.start)) return Site.toast('Set valid opening and closing dates to publish.');
    if (draft && !(state.start && state.end)) { state.start = state.start || new Date().toISOString().slice(0, 10); state.end = state.end || state.start; }
    const map = Site.stored(); map[state.id] = toRecord(draft);
    if (!Site.saveStored(map)) return Site.toast('Browser storage is full. The real backend will have no such limit; try fewer images.');
    lastSaved = state.id; Site.toast(draft ? 'Saved as draft.' : 'Published to the site.'); listSaved(); preview();
  }
  $('#a-draft').onclick = () => save(true);
  $('#a-publish').onclick = () => save(false);
  $('#a-new').onclick = () => { state = blank(); lastSaved = null; renderForm(); scrollTo({ top: 0, behavior: 'smooth' }); };

  $('#a-sample').onclick = () => {
    const mk = (seed, style, pal, ratio = 1.25) => Art.make({ seed, style, pal }, ratio, 900);
    const w = (t, yr, med, cat, wd, h, style, pal, seed, status = 'Available', price = 9500) => ({ title: t, year: yr, medium: med, cat, w: wd, h, status, price, desc: '', image: mk(seed, style, pal, wd / h) });
    state = {
      ...blank(), title: 'Salt & Ember', subtitle: 'A sample exhibition created from the upload form.', edition: 7, start: '2028-09-15', end: '2028-11-12',
      venue: 'The Long Gallery', city: 'Your City', address: '14 Wharf Road', curator: 'To be announced', hours: 'Tue – Sun, 10:00 – 18:00', tickets: 'Free entry', accent: '#e8702f',
      cover: mk('sample-cover', 'seascape', 'ember', 1.6), pull: 'Where the sea meets the fire.',
      statementText: 'Sample statement. This paragraph was typed into the upload form and will appear in the artist\'s statement section of the exhibition page.\n\nA second paragraph appears here. Real content from the artist will replace all of this.',
      rooms: [
        { name: 'Salt', text: 'Cool light, wide water.', wall: '#0f1a1e', works: [w('Harbour Morning', 2028, 'Oil on linen', 'Seascape', 180, 120, 'seascape', 'tide', 'sa1'), w('The Quiet Quay', 2028, 'Oil on linen', 'Seascape', 120, 90, 'seascape', 'indigo', 'sa2'), w('Gull Weather', 2027, 'Watercolour', 'Landscape', 60, 80, 'landscape', 'tide', 'sa3', 'Sold', null)] },
        { name: 'Ember', text: 'Warm rooms, late hours.', wall: '#1b1210', works: [w('Hearth Study', 2028, 'Oil on panel', 'Still life', 70, 90, 'stilllife', 'ember', 'sa4'), w('The Slow Fire', 2028, 'Oil on linen', 'Abstract', 220, 150, 'colorfield', 'ember', 'sa5', 'Reserved', 26000)] },
      ],
      installation: [{ caption: 'Salt room at the install', image: mk('si1', 'seascape', 'tide', 1.5) }, { caption: 'Opening night', image: mk('si2', 'city', 'dusk', 1.5) }],
      press: [{ quote: 'A sample quote about how good the show is.', source: 'The Sample Review' }], catalogue: { title: 'Salt & Ember', pages: 120, price: 55 },
    };
    renderForm(); Site.toast('Sample loaded. Save or publish it to see it on the site.');
  };

  /* ---------- saved list ---------- */
  function listSaved() {
    const rows = Object.values(Site.stored()).sort((a, b) => b.start.localeCompare(a.start));
    $('#saved').innerHTML = rows.length ? rows.map(e => `
      <div class="flex flex-wrap items-center gap-4 py-5 border-b border-ink/15">
        <span class="display text-4xl flex-1 min-w-[200px]">${esc(e.title)}</span>
        <span class="eyebrow px-3 py-1 rounded-full ${e.draft ? 'bg-ink/10' : 'bg-emerald-600 text-white'}">${e.draft ? 'Draft' : 'Published'}</span>
        <span class="eyebrow text-smoke">${Site.range(e)}</span>
        <a href="exhibition.html?id=${e.id}" class="p-2 hover:text-ember" aria-label="Open"><i data-lucide="external-link" class="w-4 h-4"></i></a>
        <button data-edit="${e.id}" class="p-2 hover:text-ember" aria-label="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
        <button data-del="${e.id}" class="p-2 hover:text-ember" aria-label="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`).join('')
      : '<p class="py-10 text-smoke">Nothing saved yet. Published exhibitions show up here and across the public site.</p>';
    lucide.createIcons();
  }
  $('#saved').addEventListener('click', e => {
    const ed = e.target.closest('[data-edit]'), de = e.target.closest('[data-del]'), map = Site.stored();
    if (ed) {
      const r = map[ed.dataset.edit];
      state = { ...blank(), ...r, statementText: (r.statement || []).join('\n\n'), cover: r.cover?.image || null, press: (r.press || []).map(([quote, source]) => ({ quote, source })), installation: r.installation || [], rooms: r.rooms.map(x => ({ ...x })), catalogue: { ...blank().catalogue, ...r.catalogue } };
      lastSaved = state.id; renderForm(); scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (de && confirm('Delete this exhibition from this browser?')) { delete map[de.dataset.del]; Site.saveStored(map); listSaved(); }
  });

  renderForm(); listSaved();
})();
