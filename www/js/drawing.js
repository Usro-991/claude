/* Dunia Ceria — Menggambar bebas & menebalkan huruf/angka di layar sentuh */
'use strict';

const PALETTE = [
  '#FF4B4B', '#FF8A1F', '#FFD23F', '#3CC45B', '#2EC4B6', '#2F80ED',
  '#9B51E0', '#FF7EB6', '#8B5A2B', '#222222', '#9E9E9E', 'rainbow',
];
const STAMPS = ['⭐', '❤️', '🌸', '☀️', '🐱', '🐟', '🚗', '🎈', '🌈', '🍎', '🦋', '🌙'];
const SIZES = [6, 14, 28];

/**
 * Papan gambar yang dapat dipakai ulang.
 * template: fungsi (ctx, w, h) untuk menggambar pola latar (huruf putus-putus), opsional.
 */
function DrawingBoard(container, { template = null, onChange = null } = {}) {
  const box = h('div', { class: 'canvas-box' });
  const bg = h('canvas');
  const cv = h('canvas');
  box.append(bg, cv);
  container.append(box);

  const bctx = bg.getContext('2d');
  const ctx = cv.getContext('2d');
  const state = { color: '#2F80ED', size: SIZES[1], tool: 'pen', stamp: '⭐', hue: 0 };
  const undo = [];
  let dpr = 1;
  let W = 0;
  let H = 0;

  function drawTemplate() {
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.fillStyle = '#fff';
    bctx.fillRect(0, 0, W, H);
    if (template) template(bctx, W, H);
  }

  function resize() {
    const r = box.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const old = W ? (() => { const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height; t.getContext('2d').drawImage(cv, 0, 0); return t; })() : null;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    for (const c of [bg, cv]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (old) ctx.drawImage(old, 0, 0, old.width, old.height, 0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawTemplate();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(box);

  function snapshot() {
    try {
      undo.push(ctx.getImageData(0, 0, cv.width, cv.height));
      if (undo.length > 15) undo.shift();
    } catch (e) { /* abaikan */ }
  }

  function strokeColor() {
    if (state.color === 'rainbow') {
      state.hue = (state.hue + 4) % 360;
      return `hsl(${state.hue}, 90%, 55%)`;
    }
    return state.color;
  }

  let active = null;
  let last = null;
  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  cv.addEventListener('pointerdown', (e) => {
    if (active !== null) return;
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    active = e.pointerId;
    snapshot();
    const p = pos(e);
    if (state.tool === 'stamp') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `${state.size * 3 + 20}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.stamp, p.x, p.y);
      Sfx.pop();
      active = null;
      if (onChange) onChange();
      return;
    }
    last = p;
    ctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = strokeColor();
    ctx.beginPath();
    ctx.arc(p.x, p.y, (state.tool === 'eraser' ? state.size * 1.6 : state.size) / 2, 0, Math.PI * 2);
    ctx.fill();
  });
  cv.addEventListener('pointermove', (e) => {
    if (e.pointerId !== active || !last) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      const p = pos(ev);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = state.tool === 'eraser' ? state.size * 1.6 : state.size;
      ctx.strokeStyle = strokeColor();
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    }
  });
  const end = (e) => {
    if (e.pointerId !== active) return;
    active = null;
    last = null;
    ctx.globalCompositeOperation = 'source-over';
    if (onChange) onChange();
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);

  return {
    state,
    undo() {
      const img = undo.pop();
      if (img) ctx.putImageData(img, 0, 0);
    },
    clear() {
      snapshot();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    setTemplate(fn) { template = fn; drawTemplate(); },
    /** Gabungkan latar + gambar menjadi JPEG kecil untuk galeri. */
    toImage(maxW = 480) {
      const s = Math.min(1, maxW / cv.width);
      const t = document.createElement('canvas');
      t.width = Math.round(cv.width * s);
      t.height = Math.round(cv.height * s);
      const c = t.getContext('2d');
      c.drawImage(bg, 0, 0, t.width, t.height);
      c.drawImage(cv, 0, 0, t.width, t.height);
      return t.toDataURL('image/jpeg', 0.8);
    },
    destroy() { ro.disconnect(); },
  };
}

/** Bilah alat: warna, ukuran, penghapus, stempel, undo, hapus, simpan. */
function drawToolbar(board, { extra = [] } = {}) {
  const colors = h('div', { class: 'toolbar' });
  const tools = h('div', { class: 'toolbar' });
  const refresh = () => {
    colors.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('on', board.state.tool === 'pen' && s.dataset.c === board.state.color));
    tools.querySelectorAll('[data-t]').forEach((t) => {
      const [kind, val] = t.dataset.t.split(':');
      const on = kind === 'size' ? +val === board.state.size
        : kind === 'eraser' ? board.state.tool === 'eraser'
          : kind === 'stamp' ? board.state.tool === 'stamp' && board.state.stamp === val : false;
      t.classList.toggle('on', on);
    });
  };
  PALETTE.forEach((c) => {
    colors.append(h('button', {
      class: 'swatch',
      'data-c': c,
      'aria-label': c === 'rainbow' ? 'pelangi' : 'warna',
      style: { background: c === 'rainbow' ? 'conic-gradient(red, orange, yellow, lime, cyan, blue, violet, red)' : c },
      onclick: () => { Sfx.tap(); board.state.color = c; board.state.tool = 'pen'; refresh(); },
    }));
  });
  SIZES.forEach((s) => {
    tools.append(h('button', {
      class: 'tool', 'data-t': 'size:' + s,
      onclick: () => { Sfx.tap(); board.state.size = s; if (board.state.tool === 'stamp') board.state.tool = 'pen'; refresh(); },
    }, h('span', { class: 'dot', style: { width: Math.max(8, s * 0.9) + 'px', height: Math.max(8, s * 0.9) + 'px' } })));
  });
  tools.append(
    h('button', { class: 'tool', 'data-t': 'eraser', onclick: () => { Sfx.tap(); board.state.tool = 'eraser'; refresh(); } }, '🧽'),
    h('button', { class: 'tool', onclick: () => { Sfx.tap(); board.undo(); } }, '↩️'),
    h('button', { class: 'tool', onclick: () => { Sfx.pop(); board.clear(); speak('Bersih lagi'); } }, '🗑️'),
    ...extra
  );
  STAMPS.forEach((st) => {
    tools.append(h('button', {
      class: 'tool', 'data-t': 'stamp:' + st,
      onclick: () => { Sfx.tap(); board.state.tool = 'stamp'; board.state.stamp = st; refresh(); },
    }, st));
  });
  refresh();
  return [colors, tools];
}

function saveToGallery(board) {
  const list = Store.get('gallery', []);
  list.unshift(board.toImage());
  while (list.length > 12) list.pop();
  Store.set('gallery', list);
  celebrate('Tersimpan!', { star: true, say: false });
  speak('Gambarmu sudah disimpan. Bagus sekali!');
}

/* ================= Menggambar bebas ================= */
Screens['draw'] = (root) => {
  root.append(topbar('Menggambar 🎨'));
  const wrap = h('div', { class: 'draw-wrap' });
  root.append(wrap);
  const board = DrawingBoard(wrap);
  const [colors, tools] = drawToolbar(board, {
    extra: [
      h('button', { class: 'tool', onclick: () => saveToGallery(board) }, '💾'),
      h('button', { class: 'tool', onclick: () => go('gallery') }, '🖼️'),
    ],
  });
  wrap.append(colors, tools);
  return () => board.destroy();
};

Screens['gallery'] = (root) => {
  root.append(topbar('Galeri Gambarku'));
  const list = Store.get('gallery', []);
  if (!list.length) {
    root.append(h('div', { class: 'center' }, h('div', { style: { fontSize: '80px' } }, '🖼️'), h('p', { class: 'hint' }, 'Belum ada gambar. Ayo menggambar lalu tekan 💾')));
    return;
  }
  const g = h('div', { class: 'gallery' });
  list.forEach((src, i) => {
    g.append(h('div', null,
      h('img', { src, alt: 'gambar ' + (i + 1) }),
      h('button', {
        class: 'tool', style: { margin: '6px auto 0' },
        onclick: () => {
          const l = Store.get('gallery', []);
          l.splice(i, 1);
          Store.set('gallery', l);
          go('gallery', {}, { replace: true });
        },
      }, '🗑️')));
  });
  root.append(g);
};

/* ================= Menebalkan (tracing) ================= */
const TRACE_SETS = {
  angka: { title: 'Menulis Angka', items: '0123456789'.split(''), say: (x) => 'angka ' + numWord(+x) },
  abc: { title: 'Menulis Huruf ABC', items: ABC.map((x) => x[0]), say: (x) => 'huruf ' + ABC_SAY[x], lower: true },
  hijaiyah: { title: 'Menulis Hijaiyah', items: HIJAIYAH.map((x) => x.ch), arab: true },
};

function traceTemplate(text, arab) {
  return (c, w, hh) => {
    const size = Math.min(w * (text.length > 1 ? 0.45 : 0.75), hh * 0.8);
    c.save();
    c.font = `${arab ? '' : 'bold '}${size}px ${arab ? '"Amiri", "Noto Naskh Arabic", serif' : '"Comic Sans MS", "Nunito", sans-serif'}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#F1ECE4';
    c.fillText(text, w / 2, hh / 2 + (arab ? size * 0.05 : size * 0.04));
    c.setLineDash([size / 22, size / 26]);
    c.lineWidth = Math.max(3, size / 70);
    c.strokeStyle = '#C9B9A6';
    c.strokeText(text, w / 2, hh / 2 + (arab ? size * 0.05 : size * 0.04));
    c.restore();
  };
}

Screens['trace-pick'] = (root, { set = 'angka' }) => {
  root.append(topbar('Menulis'));
  let cur = set;
  const grid = h('div', { class: 'letter-grid ltr' });
  const render = () => {
    grid.innerHTML = '';
    grid.className = 'letter-grid' + (cur === 'hijaiyah' ? '' : ' ltr');
    TRACE_SETS[cur].items.forEach((x, i) => {
      grid.append(h('button', { class: 'letter-card', onclick: () => { Sfx.tap(); go('trace', { set: cur, i }); } },
        h('span', { class: 'ch' + (cur === 'hijaiyah' ? ' arab' : '') }, x)));
    });
  };
  root.append(segmented([['angka', '123'], ['abc', 'ABC'], ['hijaiyah', 'ا ب ت']], cur, (v) => { cur = v; render(); }),
    h('p', { class: 'hint' }, 'Pilih, lalu tebalkan garis putus-putus dengan jarimu ✍️'), grid);
  render();
};

Screens['trace'] = (root, { set = 'angka', i = 0 }) => {
  const S = TRACE_SETS[set];
  const text = S.items[i];
  const shown = S.lower ? text + text.toLowerCase() : text;
  root.append(topbar(S.title, { sayTitle: false }));
  const wrap = h('div', { class: 'draw-wrap' });
  root.append(wrap);
  const board = DrawingBoard(wrap, { template: traceTemplate(shown, S.arab) });
  board.state.size = SIZES[2];
  board.state.color = '#FF4B4B';
  const nav = (d) => go('trace', { set, i: (i + d + S.items.length) % S.items.length }, { replace: true });
  const say = () => (S.arab ? sayArab(HIJAIYAH[i].say) : speak(S.say(text)));
  const [colors, tools] = drawToolbar(board, {
    extra: [
      h('button', { class: 'tool', onclick: () => { Sfx.good(); confetti(20); addStar(); speak('Hebat! Tulisanmu bagus'); } }, '✅'),
      h('button', { class: 'tool', onclick: say }, '🔊'),
      h('button', { class: 'tool', onclick: () => saveToGallery(board) }, '💾'),
    ],
  });
  wrap.append(h('div', { class: 'pager', style: { justifyContent: 'center' } },
    h('button', { class: 'round-btn', onclick: () => nav(-1) }, '⬅'),
    h('div', { class: 'count' }, (i + 1) + ' / ' + S.items.length),
    h('button', { class: 'round-btn', onclick: () => nav(1) }, '➡')), colors, tools);
  say();
  return () => board.destroy();
};
