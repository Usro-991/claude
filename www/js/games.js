/* Dunia Ceria — ABC, hewan, warna, bentuk, kartu memori, pecah balon */
'use strict';

/* ---------- Definisi materi belajar kartu ---------- */
const LEARN_KINDS = {
  abc: {
    title: 'Huruf ABC',
    items: ABC,
    card: ([L, word, emoji]) => h('div', { class: 'learn-card' },
      h('div', { class: 'letter' }, L + L.toLowerCase()),
      h('div', { class: 'emoji' }, emoji),
      h('div', { class: 'word' }, h('b', null, word[0]), word.slice(1))),
    say: ([L, word]) => ABC_SAY[L] + '. ' + ABC_SAY[L] + ', ' + word,
    choice: ([L]) => L,
    question: ([L]) => 'Mana huruf ' + ABC_SAY[L] + '?',
    label: ([L]) => 'Mana huruf ' + L + '?',
  },
  animals: {
    title: 'Mengenal Hewan',
    items: ANIMALS,
    card: ([emoji, name, sound]) => h('div', { class: 'learn-card' },
      h('div', { class: 'emoji' }, emoji),
      h('div', { class: 'word' }, name),
      h('div', { class: 'hint' }, '🔊 ' + sound)),
    say: ([, name, sound]) => 'Ini ' + name + '. ' + sound,
    choice: ([emoji]) => emoji,
    question: ([, name]) => 'Mana ' + name + '?',
    label: ([, name]) => 'Mana ' + name + '?',
  },
  colors: {
    title: 'Mengenal Warna',
    items: COLOR_LIST,
    card: ([name, c]) => h('div', { class: 'learn-card' },
      h('div', { class: 'color-blob', style: { background: c } }),
      h('div', { class: 'word', style: { marginTop: '14px' } }, name)),
    say: ([name]) => 'Ini warna ' + name,
    choice: () => '',
    choiceStyle: ([, c]) => ({ background: c }),
    choiceClass: 'color',
    question: ([name]) => 'Mana warna ' + name + '?',
    label: ([name]) => 'Mana warna ' + name + '?',
  },
  shapes: {
    title: 'Mengenal Bentuk',
    items: SHAPES,
    card: ([name, svg], i) => h('div', { class: 'learn-card' },
      h('div', { class: 'shape-svg', html: shapeSvg(svg, PAD_COLORS[i % PAD_COLORS.length]) }),
      h('div', { class: 'word' }, name)),
    say: ([name]) => 'Ini bentuk ' + name,
    choice: ([, svg], i) => h('span', { html: shapeSvg(svg, PAD_COLORS[i % PAD_COLORS.length]) }),
    question: ([name]) => 'Mana ' + name + '?',
    label: ([name]) => 'Mana ' + name + '?',
  },
};

Screens['learn'] = (root, { kind, mode = 'learn', i = 0 }, tok) => {
  const K = LEARN_KINDS[kind];
  root.append(topbar(K.title, { sayTitle: false }),
    segmented([['learn', '📖 Belajar'], ['quiz', '🎯 Tebak']], mode, (v) => go('learn', { kind, mode: v }, { replace: true })));
  const body = h('div', { class: 'center' });
  root.append(body);

  if (mode === 'learn') {
    const item = K.items[i];
    const card = K.card(item, i);
    card.style.animation = 'appear .45s';
    card.addEventListener('click', () => { Sfx.tap(); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'wiggle .5s'; speak(K.say(item)); });
    const nav = (d) => go('learn', { kind, mode, i: (i + d + K.items.length) % K.items.length }, { replace: true });
    body.append(card, h('div', { class: 'pager' },
      h('button', { class: 'round-btn', onclick: () => { Sfx.tap(); nav(-1); } }, '⬅'),
      h('div', { class: 'count' }, (i + 1) + ' / ' + K.items.length),
      h('button', { class: 'round-btn', onclick: () => { Sfx.tap(); nav(1); } }, '➡')));
    // Geser kiri/kanan untuk pindah kartu
    let sx = null;
    body.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    body.addEventListener('pointerup', (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 70) nav(dx < 0 ? 1 : -1);
    });
    speak(K.say(item));
    return;
  }

  let n = Store.get('learnQuizN', 3);
  const qbody = h('div', { class: 'center' });
  body.replaceWith(qbody);
  root.insertBefore(segmented([[2, '2 pilihan'], [3, '3 pilihan'], [4, '4 pilihan']], n, (v) => { n = v; Store.set('learnQuizN', v); round(); }), qbody);

  function round() {
    if (!alive(tok)) return;
    const idx = shuffle(K.items.map((_, k) => k)).slice(0, n);
    const target = idx[0];
    const opts = shuffle(idx);
    qbody.innerHTML = '';
    const ask = () => speak(K.question(K.items[target]));
    const row = h('div', { class: 'choices' });
    let busy = false;
    opts.forEach((k) => {
      const it = K.items[k];
      const b = h('button', { class: 'choice ' + (K.choiceClass || ''), style: K.choiceStyle ? K.choiceStyle(it) : null }, K.choice(it, k));
      b.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        if (k === target) {
          b.classList.add('right');
          await celebrate();
          if (!alive(tok)) return;
          await speak(K.say(it));
          await sleep(step(600), tok) && round();
        } else {
          b.classList.add('wrong');
          setTimeout(() => b.classList.remove('wrong'), 500);
          Sfx.soft();
          await speak('Itu ' + K.say(it).replace(/^Ini /, '').split('.')[0] + '. Coba lagi');
          busy = false;
        }
      });
      row.append(b);
    });
    qbody.append(
      h('div', { class: 'prompt' }, K.label(K.items[target])),
      h('button', { class: 'round-btn', style: { width: '76px', height: '76px', fontSize: '36px' }, onclick: ask }, '🔊'),
      row
    );
    ask();
  }
  round();
};

/* ================= Kartu memori (cocokkan pasangan) ================= */
Screens['memory'] = (root, params, tok) => {
  let pairs = Store.get('memPairs', 3);
  const body = h('div', { class: 'center' });
  root.append(topbar('Cocokkan Kartu'),
    segmented([[2, '2 pasang'], [3, '3 pasang'], [4, '4 pasang'], [6, '6 pasang'], [8, '8 pasang']], pairs, (v) => { pairs = v; Store.set('memPairs', v); start(); }),
    body);

  function start() {
    if (!alive(tok)) return;
    const chosen = shuffle(ANIMALS).slice(0, pairs);
    const deck = shuffle([...chosen, ...chosen]);
    const cols = deck.length <= 4 ? 2 : deck.length <= 6 ? 3 : 4;
    const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: deck.length <= 4 ? '360px' : '560px' } });
    body.innerHTML = '';
    body.append(grid);
    let open = [];
    let lock = false;
    let found = 0;
    deck.forEach((a) => {
      const c = h('div', { class: 'card3d' },
        h('div', { class: 'inner' }, h('div', { class: 'face back' }, '❓'), h('div', { class: 'face front' }, a[0])));
      c.addEventListener('click', async () => {
        if (lock || c.classList.contains('open') || c.classList.contains('done')) return;
        Sfx.flip();
        c.classList.add('open');
        speak(a[1]);
        open.push([c, a]);
        if (open.length < 2) return;
        lock = true;
        const [[c1, a1], [c2, a2]] = open;
        open = [];
        await sleep(700);
        if (!alive(tok)) return;
        if (a1 === a2) {
          c1.classList.add('done');
          c2.classList.add('done');
          c1.classList.remove('open');
          c2.classList.remove('open');
          found++;
          Sfx.good();
          if (found === pairs) {
            await celebrate('Semua cocok!');
            await sleep(1200, tok) && start();
          } else {
            await speak('Cocok! ' + a1[2]);
          }
        } else {
          await sleep(500);
          c1.classList.remove('open');
          c2.classList.remove('open');
        }
        lock = false;
      });
      grid.append(c);
    });
    speak('Cari kartu yang sama');
  }
  start();
};

/* ================= Pecah balon (untuk si kecil) ================= */
const BALLOON_MODES = {
  angka: () => { const n = rand(10) + 1; return [String(n), () => speak(numWord(n))]; },
  huruf: () => { const [L, w] = pick(ABC); return [L, () => speak(ABC_SAY[L] + ', ' + w)]; },
  hijaiyah: () => { const L = pick(HIJAIYAH); return [L.ch, () => sayArab(L.say), true]; },
  warna: () => { const [name] = pick(COLOR_LIST.slice(0, 8)); return ['', () => speak(name)]; },
};

Screens['balloon'] = (root, params, tok) => {
  let mode = Store.get('balloonMode', 'angka');
  root.append(topbar('Pecah Balon 🎈'),
    segmented([['angka', '123'], ['huruf', 'ABC'], ['hijaiyah', 'ا ب ت'], ['warna', '🎨 Warna']], mode, (v) => { mode = v; Store.set('balloonMode', v); }));
  const sky = h('div', { class: 'sky' }, h('div', { class: 'cloud', style: { left: '8%', top: '10%' } }, '☁️'), h('div', { class: 'cloud', style: { right: '10%', top: '30%' } }, '☁️'));
  root.append(sky);
  let popped = 0;
  const balloons = [];
  let lastSpawn = 0;
  let raf = 0;

  function spawn() {
    const w = sky.clientWidth;
    const hgt = sky.clientHeight;
    if (!w) return;
    const colorIdx = rand(8);
    const [name, color] = COLOR_LIST[colorIdx];
    let [label, sayFn, arab] = BALLOON_MODES[mode]();
    if (mode === 'warna') sayFn = () => speak(name);
    const el = h('div', {
      class: 'balloon' + (arab ? ' arab' : ''),
      style: { background: color, left: Math.random() * (w - 92) + 'px', top: hgt + 'px' },
    }, label);
    const b = { el, y: hgt, speed: 0.6 + Math.random() * 0.7, x0: parseFloat(el.style.left), t: Math.random() * 6 };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (el.classList.contains('pop')) return;
      el.classList.add('pop');
      Sfx.pop();
      sayFn();
      popped++;
      if (popped % 10 === 0) celebrate(null, { say: false });
      setTimeout(() => el.remove(), 260);
      b.dead = true;
    });
    sky.append(el);
    balloons.push(b);
  }

  function loop(ts) {
    if (!alive(tok)) return;
    if (ts - lastSpawn > 1100 && balloons.length < 7) { spawn(); lastSpawn = ts; }
    for (let k = balloons.length - 1; k >= 0; k--) {
      const b = balloons[k];
      if (!b.dead) {
        b.y -= b.speed;
        b.t += 0.03;
        b.el.style.top = b.y + 'px';
        b.el.style.left = b.x0 + Math.sin(b.t) * 12 + 'px';
      }
      if (b.dead || b.y < -130) {
        if (!b.dead) b.el.remove();
        balloons.splice(k, 1);
      }
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  speak('Pecahkan balonnya!');
  return () => cancelAnimationFrame(raf);
};
