/* Procedural "painting" placeholders.
   <img data-art="seed|style|palette" data-ratio="0.8" data-res="640">
   Once the backend exists, render real <img src="..."> instead (see Site.img in layout.js). */
(function () {
  const PAL = {
    ember:  ['#1c0f0b', '#6b2314', '#b83a1b', '#e8702f', '#f4b867', '#f8e8c9'],
    tide:   ['#07202b', '#0f4c5c', '#2a7f8e', '#8cc3c2', '#e9dcc0', '#d9822b'],
    moss:   ['#121d16', '#2f4a35', '#6b8a4a', '#b7c47a', '#ecdfae', '#8a4b2a'],
    dusk:   ['#150f2a', '#3a2a6b', '#8a4f9e', '#e0749a', '#f7b58a', '#fbe4c4'],
    clay:   ['#26170f', '#6e3b28', '#b5694a', '#dba87f', '#efe0c9', '#3f5a5c'],
    indigo: ['#0a1330', '#1c2f6b', '#3b5bb5', '#9fb4e8', '#f1ece0', '#d9a441'],
    rose:   ['#2b0f1a', '#7a1f3d', '#c9506b', '#f0a6a6', '#f8e1d4', '#2f4a46'],
    mono:   ['#0d0d0d', '#2e2e2e', '#6b6b6b', '#b5b2aa', '#e8e4da', '#f7f4ec'],
    ochre:  ['#2b1d08', '#7a5212', '#c68a1e', '#ecc15a', '#f6e6b4', '#3c5a64'],
    jade:   ['#0b1f1b', '#1c5a4d', '#2f9a80', '#9ad6bd', '#f0ead2', '#e0723a'],
  };

  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = s => { let a = hash(String(s)); return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const wave = r => { const a = [r() * 6, r() * 6, r() * 6], f = [1.2 + r() * 2, 3 + r() * 3, 7 + r() * 5]; return x => Math.sin(x * f[0] * 3 + a[0]) * .55 + Math.sin(x * f[1] * 3 + a[1]) * .3 + Math.sin(x * f[2] * 3 + a[2]) * .15; };
  const pick = (r, p, lo = 0, hi = 6) => p[lo + (r() * (hi - lo) | 0)];

  function brush(c, x, y, len, ang, w, color, alpha, r) {
    const n = Math.max(3, Math.round(w / 2.2));
    c.lineCap = 'round'; c.strokeStyle = color;
    for (let i = 0; i < n; i++) {
      const off = (i / (n - 1) - .5) * w, ox = -Math.sin(ang) * off, oy = Math.cos(ang) * off, l = len * (.75 + r() * .25);
      c.globalAlpha = alpha * (.5 + r() * .5); c.lineWidth = 1.2 + r() * 2.2;
      const sx = x + ox + (r() - .5) * 2, sy = y + oy;
      c.beginPath(); c.moveTo(sx, sy);
      c.quadraticCurveTo(sx + Math.cos(ang) * l * .5 + (r() - .5) * w * .4, sy + Math.sin(ang) * l * .5 + (r() - .5) * w * .4, sx + Math.cos(ang) * l, sy + Math.sin(ang) * l);
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  const glow = (c, x, y, rad, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
  const disc = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 6.3); c.fill(); };

  const STYLES = {
    landscape(c, W, H, r, p) {
      const hz = H * (.42 + r() * .14);
      const g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, p[1]); g.addColorStop(.55, p[3]); g.addColorStop(1, p[4]);
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const sx = W * (.2 + r() * .6), sy = hz * (.3 + r() * .35), sr = W * (.05 + r() * .05);
      glow(c, sx, sy, sr * 6, p[5], .9); disc(c, sx, sy, sr, p[5]);
      for (let i = 0; i < 46; i++) brush(c, r() * W, r() * hz * .9, W * (.12 + r() * .28), (r() - .5) * .1, 6 + r() * 14, r() < .5 ? p[5] : p[2], .22, r);
      const L = 4 + (r() * 2 | 0);
      for (let l = 0; l < L; l++) {
        const t = l / (L - 1), base = hz * .92 + (H - hz * .92) * t * .8, amp = H * (.05 + .05 * r()), w = wave(r), col = mix(p[3], p[0], .25 + t * .7);
        c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) c.lineTo(x, base - amp * w(x / W));
        c.lineTo(W, H); c.closePath(); c.fill();
        for (let i = 0; i < 40; i++) brush(c, r() * W, base + r() * (H - base) * .5, W * .12, (r() - .5) * .3, 10, mix(col, r() < .5 ? p[4] : p[0], .35), .3, r);
      }
    },
    seascape(c, W, H, r, p) {
      const hz = H * (.4 + r() * .12);
      let g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, p[1]); g.addColorStop(.7, p[3]); g.addColorStop(1, p[5]);
      c.fillStyle = g; c.fillRect(0, 0, W, hz);
      glow(c, W * (.25 + r() * .5), hz * .75, W * .35, p[5], .8);
      for (let i = 0; i < 30; i++) brush(c, r() * W, r() * hz, W * (.15 + r() * .3), (r() - .5) * .06, 8 + r() * 12, r() < .5 ? p[4] : p[2], .2, r);
      g = c.createLinearGradient(0, hz, 0, H); g.addColorStop(0, p[3]); g.addColorStop(.3, p[2]); g.addColorStop(1, p[0]);
      c.fillStyle = g; c.fillRect(0, hz, W, H - hz);
      for (let i = 0; i < 260; i++) {
        const d = Math.pow(r(), 1.6), y = hz + d * (H - hz);
        brush(c, r() * W, y, W * (.05 + d * .3) * (.5 + r()), (r() - .5) * .06, 3 + d * 16, r() < .4 ? p[5] : (r() < .5 ? p[3] : p[0]), .3, r);
      }
      c.lineCap = 'round';
      for (let i = 0; i < 16; i++) { c.strokeStyle = rgba(p[5], .45); c.lineWidth = 2 + r() * 3; const y = H * (.7 + r() * .28), x = r() * W; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + W * .08, y - H * .02, x + W * .2, y); c.stroke(); }
      const bx = W * (.2 + r() * .6), by = hz + (H - hz) * .12; c.fillStyle = p[0];
      c.beginPath(); c.moveTo(bx - W * .05, by); c.lineTo(bx + W * .05, by); c.lineTo(bx + W * .03, by + H * .02); c.lineTo(bx - W * .035, by + H * .02); c.fill();
      c.fillRect(bx - 1, by - H * .08, 2.5, H * .08);
    },
    abstract(c, W, H, r, p) {
      c.fillStyle = pick(r, p, 0, 3); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) { c.save(); c.translate(r() * W, r() * H); c.rotate((r() - .5) * 1.2); c.fillStyle = rgba(pick(r, p), .55 + r() * .4); const w = W * (.25 + r() * .6), h = H * (.1 + r() * .45); c.fillRect(-w / 2, -h / 2, w, h); c.restore(); }
      for (let i = 0; i < 34; i++) brush(c, r() * W, r() * H, W * (.2 + r() * .5), (r() - .5) * 1.1, 18 + r() * 50, pick(r, p), .55, r);
      for (let i = 0; i < 4; i++) glow(c, r() * W, r() * H, W * (.08 + r() * .18), pick(r, p, 3, 6), .9);
      for (let i = 0; i < 90; i++) disc(c, r() * W, r() * H, 1 + r() * 4, rgba(pick(r, p), .8));
      c.strokeStyle = rgba(p[0], .7); c.lineWidth = 2;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(r() * W, r() * H); c.lineTo(r() * W, r() * H); c.stroke(); }
    },
    colorfield(c, W, H, r, p) {
      c.fillStyle = mix(p[1], p[0], .3 + r() * .4); c.fillRect(0, 0, W, H);
      const n = 2 + (r() * 2 | 0); let y = H * .08;
      for (let i = 0; i < n; i++) {
        const h = (H * .84 / n) * (.8 + r() * .25), col = p[2 + ((i + (r() * 2 | 0)) % 4)];
        c.save(); c.shadowColor = col; c.shadowBlur = W * .05; c.fillStyle = col; c.fillRect(W * .1, y, W * .8, h * .88); c.restore();
        y += h;
      }
    },
    portrait(c, W, H, r, p) {
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, p[1]); g.addColorStop(1, p[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const cx = W * (.45 + r() * .1), cy = H * .38, hr = W * .2, skin = p[4], shade = mix(p[4], p[1], .55);
      disc(c, cx, cy, hr * 1.9, rgba(p[3], .4));
      c.fillStyle = p[3]; c.beginPath(); c.moveTo(cx - W * .5, H); c.quadraticCurveTo(cx - W * .42, H * .7, cx - hr * .9, H * .62); c.lineTo(cx + hr * .9, H * .62); c.quadraticCurveTo(cx + W * .42, H * .7, cx + W * .5, H); c.fill();
      c.fillStyle = shade; c.fillRect(cx - hr * .3, cy, hr * .6, H * .28);
      c.fillStyle = skin; c.beginPath(); c.ellipse(cx, cy, hr * .78, hr * 1.05, 0, 0, 6.3); c.fill();
      c.save(); c.beginPath(); c.ellipse(cx, cy, hr * .78, hr * 1.05, 0, 0, 6.3); c.clip(); c.fillStyle = rgba(shade, .75); c.fillRect(cx + hr * .08, cy - hr * 1.2, hr, hr * 2.5); c.restore();
      c.fillStyle = p[0]; c.beginPath(); c.ellipse(cx, cy - hr * .35, hr * .86, hr * .85, 0, Math.PI, 0); c.lineTo(cx + hr * .86, cy - hr * .1); c.lineTo(cx - hr * .86, cy - hr * .1); c.fill();
      c.fillStyle = p[0]; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * hr * .32, cy + hr * .02, hr * .13, hr * .05, 0, 0, 6.3); c.fill(); }
      c.strokeStyle = rgba(p[1], .7); c.lineWidth = 3; c.beginPath(); c.moveTo(cx + hr * .04, cy + hr * .05); c.lineTo(cx - hr * .04, cy + hr * .42); c.stroke();
      c.fillStyle = p[2]; c.beginPath(); c.ellipse(cx, cy + hr * .66, hr * .2, hr * .07, 0, 0, 6.3); c.fill();
      for (let i = 0; i < 22; i++) brush(c, r() * W, r() * H, W * .25, (r() - .5) * 1.2, 14 + r() * 24, pick(r, p), .3, r);
    },
    stilllife(c, W, H, r, p) {
      const ty = H * .68;
      let g = c.createLinearGradient(0, 0, 0, ty); g.addColorStop(0, p[1]); g.addColorStop(1, mix(p[2], p[1], .4)); c.fillStyle = g; c.fillRect(0, 0, W, ty);
      glow(c, W * (.2 + r() * .6), H * .2, W * .5, p[4], .35);
      c.fillStyle = mix(p[0], p[1], .5); c.fillRect(0, ty, W, H - ty);
      const vx = W * (.3 + r() * .15), vw = W * .17, vh = H * .34;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(vx + vw * .2, ty + 6, vw * .8, 12, 0, 0, 6.3); c.fill();
      c.fillStyle = p[3]; c.beginPath(); c.moveTo(vx - vw * .22, ty - vh);
      c.bezierCurveTo(vx - vw * .22, ty - vh * .8, vx - vw * .6, ty - vh * .55, vx - vw * .5, ty - vh * .2);
      c.bezierCurveTo(vx - vw * .48, ty, vx + vw * .48, ty, vx + vw * .5, ty - vh * .2);
      c.bezierCurveTo(vx + vw * .6, ty - vh * .55, vx + vw * .22, ty - vh * .8, vx + vw * .22, ty - vh); c.fill();
      c.fillStyle = rgba(p[5], .35); c.fillRect(vx - vw * .3, ty - vh * .6, vw * .1, vh * .45);
      for (let i = 0; i < 7; i++) { const a = -1.57 + (r() - .5) * 1.3, l = vh * (.5 + r() * .4), ex = vx + Math.cos(a) * l, ey = ty - vh + Math.sin(a) * l; c.strokeStyle = p[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(vx, ty - vh); c.lineTo(ex, ey); c.stroke(); disc(c, ex, ey, W * (.03 + r() * .03), pick(r, p, 3, 6)); }
      const bx = W * (.62 + r() * .1); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(bx, ty + 6, W * .08, 10, 0, 0, 6.3); c.fill();
      c.fillStyle = p[2]; c.fillRect(bx - W * .035, ty - H * .26, W * .07, H * .26); c.fillRect(bx - W * .014, ty - H * .34, W * .028, H * .09);
      for (let i = 0; i < 3; i++) { const fx = W * (.18 + i * .09 + r() * .04), fr = W * (.04 + r() * .015); disc(c, fx, ty + H * .08 + (i % 2) * 10, fr, pick(r, p, 2, 5)); disc(c, fx - fr * .3, ty + H * .08 - fr * .3 + (i % 2) * 10, fr * .25, rgba(p[5], .5)); }
      for (let i = 0; i < 24; i++) brush(c, r() * W, r() * H, W * .2, (r() - .5) * .5, 12 + r() * 20, pick(r, p), .25, r);
    },
    city(c, W, H, r, p) {
      const st = H * .78;
      let g = c.createLinearGradient(0, 0, 0, st); g.addColorStop(0, p[1]); g.addColorStop(.6, p[3]); g.addColorStop(1, p[4]); c.fillStyle = g; c.fillRect(0, 0, W, st);
      glow(c, W * (.3 + r() * .4), st * .8, W * .5, p[5], .5);
      const lit = [];
      for (let l = 0; l < 3; l++) {
        const col = mix(p[2], p[0], l / 2 * .9), top = st - H * (.2 + l * .06); let x = -10;
        while (x < W) {
          const bw = W * (.05 + r() * .09), bh = (st - top) * (.5 + r() * .9);
          c.fillStyle = col; c.fillRect(x, st - bh, bw, bh);
          if (l > 0) for (let wy = st - bh + 10; wy < st - 8; wy += 14) for (let wx = x + 6; wx < x + bw - 8; wx += 12) if (r() < .32) { c.fillStyle = rgba(p[5], .85); c.fillRect(wx, wy, 5, 7); lit.push([wx, wy]); }
          x += bw + r() * 6;
        }
      }
      g = c.createLinearGradient(0, st, 0, H); g.addColorStop(0, mix(p[0], p[2], .25)); g.addColorStop(1, p[0]); c.fillStyle = g; c.fillRect(0, st, W, H - st);
      lit.forEach(([x]) => { if (r() < .5) brush(c, x + 2, st + 4, H * (.05 + r() * .12), 1.57, 5, p[5], .35, r); });
      for (let i = 0; i < 40; i++) brush(c, r() * W, st + r() * (H - st), W * .15, (r() - .5) * .05, 6, pick(r, p, 1, 4), .25, r);
    },
    ink(c, W, H, r, p) {
      c.fillStyle = p[5]; c.fillRect(0, 0, W, H);
      const sx = W * (.55 + r() * .3), sy = H * .26; disc(c, sx, sy, W * .07, 'rgba(179,38,30,.88)');
      for (let l = 0; l < 4; l++) {
        const base = H * (.45 + l * .13), w = wave(r), amp = H * (.12 - l * .015);
        c.fillStyle = rgba(p[0], .1 + l * .17); c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) c.lineTo(x, base - amp * Math.abs(w(x / W)) * 1.6);
        c.lineTo(W, H); c.fill();
        const mg = c.createLinearGradient(0, base - amp, 0, base + amp * .6); mg.addColorStop(0, 'rgba(247,244,236,0)'); mg.addColorStop(1, 'rgba(247,244,236,.85)'); c.fillStyle = mg; c.fillRect(0, base - amp, W, amp * 1.6);
      }
      for (let i = 0; i < 16; i++) brush(c, W * (.05 + r() * .9), H * (.62 + r() * .3), H * (.1 + r() * .22), -1.57 + (r() - .5) * .25, 5 + r() * 12, p[0], .7, r);
      for (let i = 0; i < 40; i++) brush(c, r() * W, r() * H, W * .1, (r() - .5) * .3, 4, rgba(p[0], .5), .25, r);
    },
    figurative(c, W, H, r, p) {
      const gy = H * .68;
      let g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, p[2]); g.addColorStop(1, p[4]); c.fillStyle = g; c.fillRect(0, 0, W, gy);
      disc(c, W * (.3 + r() * .4), H * .3, W * .22, rgba(p[5], .55));
      c.fillStyle = mix(p[1], p[0], .5); c.fillRect(0, gy, W, H - gy);
      const n = 2 + (r() * 2 | 0);
      for (let i = 0; i < n; i++) {
        const fx = W * (.18 + (i + r() * .4) / n * .62), fh = H * (.38 + r() * .2), fw = W * (.09 + r() * .03), col = p[(i + 1) % 3 + 1] || p[1];
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(fx + fw * .8, gy + 8, fw * 1.3, 8, 0, 0, 6.3); c.fill();
        c.fillStyle = col; c.beginPath(); c.moveTo(fx - fw * .45, gy - fh * .78); c.quadraticCurveTo(fx - fw * .9, gy - fh * .3, fx - fw * .55, gy + 6); c.lineTo(fx + fw * .55, gy + 6); c.quadraticCurveTo(fx + fw * .9, gy - fh * .3, fx + fw * .45, gy - fh * .78); c.closePath(); c.fill();
        disc(c, fx, gy - fh * .88, fw * .38, mix(p[4], p[2], .4));
        c.fillStyle = p[0]; c.beginPath(); c.arc(fx, gy - fh * .9, fw * .4, Math.PI, 0); c.fill();
      }
      for (let i = 0; i < 28; i++) brush(c, r() * W, r() * H, W * .2, (r() - .5) * .6, 12 + r() * 20, pick(r, p), .22, r);
    },
  };

  function finish(c, W, H, r, p, ang) {
    for (let i = 0; i < 340; i++) brush(c, r() * W, r() * H, W * (.04 + r() * .1), ang + (r() - .5) * .6, 3 + r() * 10, pick(r, p), .08 + r() * .1, r);
    c.globalAlpha = .05; c.strokeStyle = '#000'; c.lineWidth = 1;
    for (let x = 0; x < W; x += 3) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 3) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.globalAlpha = 1;
    const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 2200; i++) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)'; c.fillRect(r() * W, r() * H, 1.5, 1.5); }
  }

  const cache = new Map();
  function make(spec, ratio = 1, res = 640) {
    const key = [spec.seed, spec.style, spec.pal, ratio.toFixed(3), res].join('|');
    if (cache.has(key)) return cache.get(key);
    const W = ratio >= 1 ? res : Math.round(res * ratio), H = ratio >= 1 ? Math.round(res / ratio) : res;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'), r = rng(spec.seed + spec.style), p = PAL[spec.pal] || PAL.ember;
    (STYLES[spec.style] || STYLES.abstract)(c, W, H, r, p);
    finish(c, W, H, r, p, spec.style === 'ink' ? 1.5 : .15);
    const url = cv.toDataURL('image/jpeg', .88);
    cache.set(key, url);
    return url;
  }

  const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  const queue = []; let busy = false;
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    const el = queue.shift();
    try {
      const [seed, style, pal] = el.dataset.art.split('|');
      el.src = make({ seed, style, pal }, +el.dataset.ratio || 1, +el.dataset.res || 640);
    } catch (e) { console.warn('art failed', e); }
    el.classList.add('art-ready');
    busy = false; setTimeout(pump, 0);
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); pump(); } }), { rootMargin: '600px' });
  function hydrate(root = document) {
    root.querySelectorAll('img[data-art]:not([data-art-done])').forEach(el => {
      el.dataset.artDone = 1; el.src = BLANK;
      if ('eager' in el.dataset) { queue.push(el); pump(); } else io.observe(el);
    });
  }

  window.Art = { make, hydrate, PAL };
})();
