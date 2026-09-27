/* Belajar bersama Zayn — ABC, hewan, warna, bentuk, kartu memori, pecah balon */
'use strict';

/* Contoh benda nyata supaya penjelasan terasa seperti guru di kelas */
const COLOR_EXAMPLE = {
  Merah: 'seperti buah apel', Kuning: 'seperti pisang', Biru: 'seperti langit yang cerah',
  Hijau: 'seperti daun', Oranye: 'seperti jeruk', Ungu: 'seperti buah anggur',
  'Merah muda': 'seperti bunga mawar', Cokelat: 'seperti batang pohon', Hitam: 'seperti rambut kita',
  Putih: 'seperti awan dan susu',
};
const SHAPE_EXAMPLE = {
  Lingkaran: 'Bulat, seperti bola dan roda.', Persegi: 'Sisinya ada empat, sama panjang. Seperti kotak kado.',
  Segitiga: 'Sudutnya ada tiga. Seperti potongan semangka.', 'Persegi panjang': 'Seperti pintu dan buku.',
  Bintang: 'Seperti bintang di langit malam.', Hati: 'Tanda sayang.',
  Oval: 'Lonjong, seperti telur.', 'Belah ketupat': 'Seperti layang-layang.',
};

/* ---------- Definisi materi belajar kartu ---------- */
const LEARN_KINDS = {
  abc: {
    title: 'Huruf ABC',
    intro: 'Kita belajar huruf, yuk. Geser kartunya untuk lihat huruf berikutnya.',
    items: ABC,
    card: ([L, word, emoji]) => h('div', { class: 'learn-card' },
      h('div', { class: 'letter' }, L, h('span', { class: 'lower' }, L.toLowerCase())),
      h('div', { class: 'emoji' }, emoji),
      h('div', { class: 'word' }, h('b', null, word[0]), word.slice(1))),
    say: ([L, word]) => 'Ini huruf ' + ABC_SAY[L] + '. ' + cap(ABC_SAY[L]) + ', untuk ' + word + '.',
    short: ([L]) => 'huruf ' + ABC_SAY[L],
    choice: ([L]) => L,
    question: ([L]) => line('abc-q', ['Coba cari huruf ' + ABC_SAY[L] + '.', 'Mana huruf ' + ABC_SAY[L] + '?']),
    label: ([L]) => 'Mana huruf ' + L + '?',
  },
  animals: {
    title: 'Mengenal Hewan',
    intro: 'Ayo kenalan dengan hewan-hewan. Sentuh gambarnya untuk dengar suaranya.',
    items: ANIMALS,
    card: ([emoji, name, sound]) => h('div', { class: 'learn-card' },
      h('div', { class: 'emoji' }, emoji),
      h('div', { class: 'word' }, name),
      h('div', { class: 'sound-chip' }, icon('sound', 20), sound)),
    say: ([, name, sound]) => 'Ini ' + name.toLowerCase() + '. Suaranya, ' + sound.toLowerCase() + '.',
    short: ([, name]) => name.toLowerCase(),
    choice: ([emoji]) => emoji,
    question: ([, name]) => line('ani-q', ['Mana ' + name.toLowerCase() + ', ya?', 'Coba tunjuk ' + name.toLowerCase() + '.']),
    label: ([, name]) => 'Mana ' + name.toLowerCase() + '?',
  },
  colors: {
    title: 'Mengenal Warna',
    intro: 'Dunia ini penuh warna. Yuk, kita kenali satu per satu.',
    items: COLOR_LIST,
    card: ([name, c]) => h('div', { class: 'learn-card' },
      h('div', { class: 'color-blob', style: { background: c } }),
      h('div', { class: 'word' }, name)),
    say: ([name]) => 'Ini warna ' + name.toLowerCase() + ', ' + (COLOR_EXAMPLE[name] || '') + '.',
    short: ([name]) => 'warna ' + name.toLowerCase(),
    choice: () => '',
    choiceStyle: ([, c]) => ({ background: c }),
    choiceClass: 'color',
    question: ([name]) => line('col-q', ['Mana warna ' + name.toLowerCase() + '?', 'Coba sentuh warna ' + name.toLowerCase() + '.']),
    label: ([name]) => 'Mana warna ' + name.toLowerCase() + '?',
  },
  shapes: {
    title: 'Mengenal Bentuk',
    intro: 'Ayo kita kenali bentuk-bentuk di sekitar kita.',
    items: SHAPES,
    card: ([name, svg], i) => h('div', { class: 'learn-card' },
      h('div', { class: 'shape-svg', html: shapeSvg(svg, PAD_COLORS[i % PAD_COLORS.length]) }),
      h('div', { class: 'word' }, name)),
    say: ([name]) => 'Ini ' + name.toLowerCase() + '. ' + (SHAPE_EXAMPLE[name] || ''),
    short: ([name]) => name.toLowerCase(),
    choice: ([, svg], i) => h('span', { class: 'shape-choice', html: shapeSvg(svg, PAD_COLORS[i % PAD_COLORS.length]) }),
    question: ([name]) => 'Mana ' + name.toLowerCase() + '?',
    label: ([name]) => 'Mana ' + name.toLowerCase() + '?',
  },
};

Screens['learn'] = (root, { kind, mode = 'learn', i = 0, first = true }, tok) => {
  const K = LEARN_KINDS[kind];
  root.append(topbar(K.title), coach(''),
    segmented([['learn', 'Belajar'], ['quiz', 'Main tebak']], mode, (v) => go('learn', { kind, mode: v }, { replace: true })));
  const body = h('div', { class: 'stage' });
  root.append(body);

  if (mode === 'learn') {
    const item = K.items[i];
    const card = K.card(item, i);
    card.classList.add('enter');
    card.addEventListener('click', () => {
      Sfx.tap();
      card.classList.remove('wiggle'); void card.offsetWidth; card.classList.add('wiggle');
      speak(K.say(item));
    });
    const nav = (d) => go('learn', { kind, mode, i: (i + d + K.items.length) % K.items.length, first: false }, { replace: true });
    body.append(card, h('div', { class: 'pager' },
      h('button', { class: 'icon-btn', 'aria-label': 'Sebelumnya', onclick: () => { Sfx.tap(); nav(-1); } }, icon('back', 28)),
      h('div', { class: 'count' }, (i + 1) + ' / ' + K.items.length),
      h('button', { class: 'icon-btn', 'aria-label': 'Berikutnya', onclick: () => { Sfx.tap(); nav(1); } }, icon('next', 28))));
    // Geser kiri/kanan untuk pindah kartu
    let sx = null;
    body.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    body.addEventListener('pointerup', (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 70) nav(dx < 0 ? 1 : -1);
    });
    (async () => {
      if (first && i === 0) { await speak(K.intro); if (!alive(tok)) return; }
      speak(K.say(item));
    })();
    return;
  }

  let n = Store.get('learnQuizN', 3);
  root.insertBefore(segmented([[2, '2'], [3, '3'], [4, '4']], n, (v) => { n = v; Store.set('learnQuizN', v); round(); }, 'Pilihan'), body);

  function round() {
    if (!alive(tok)) return;
    const idx = shuffle(K.items.map((_, k) => k)).slice(0, n);
    const target = idx[0];
    const opts = shuffle(idx);
    body.innerHTML = '';
    const ask = () => speak(K.question(K.items[target]));
    const row = h('div', { class: 'choices' });
    let busy = false;
    opts.forEach((k) => {
      const it = K.items[k];
      const b = h('button', { class: 'choice big ' + (K.choiceClass || ''), style: K.choiceStyle ? K.choiceStyle(it) : null, 'aria-label': K.short(it) }, K.choice(it, k));
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
          await speak(line('learn-wrong', [
            'Itu ' + K.short(it) + '. Coba cari lagi, ya.',
            'Hmm, itu ' + K.short(it) + '. Yang lain, yuk.',
            'Bukan, itu ' + K.short(it) + '. Pelan-pelan saja.',
          ]));
          busy = false;
        }
      });
      row.append(b);
    });
    body.append(
      h('button', { class: 'listen-btn', 'aria-label': 'Dengarkan lagi', onclick: ask }, icon('sound', 40)),
      row
    );
    ask();
  }
  round();
};

/* ================= Kartu memori (cocokkan pasangan) ================= */
Screens['memory'] = (root, params, tok) => {
  let pairs = Store.get('memPairs', 3);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Cocokkan Kartu'), coach(''),
    segmented([[2, '2'], [3, '3'], [4, '4'], [6, '6'], [8, '8']], pairs, (v) => { pairs = v; Store.set('memPairs', v); start(); }, 'Pasang'),
    body);

  let firstGame = true;
  function start() {
    if (!alive(tok)) return;
    const chosen = shuffle(ANIMALS).slice(0, pairs);
    const deck = shuffle([...chosen, ...chosen]);
    const cols = deck.length <= 4 ? 2 : deck.length <= 6 ? 3 : 4;
    const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: deck.length <= 4 ? '340px' : '560px' } });
    body.innerHTML = '';
    body.append(grid);
    let open = [];
    let lock = false;
    let found = 0;
    let misses = 0;
    deck.forEach((a) => {
      const c = h('button', { class: 'card3d', 'aria-label': 'Kartu' },
        h('div', { class: 'inner' }, h('div', { class: 'face back' }, icon('star', 34)), h('div', { class: 'face front' }, a[0])));
      c.addEventListener('click', async () => {
        if (lock || c.classList.contains('open') || c.classList.contains('done')) return;
        Sfx.flip();
        c.classList.add('open');
        speak(a[1] + '.', 'id-ID', 1, { show: a[1] });
        open.push([c, a]);
        if (open.length < 2) return;
        lock = true;
        const [[c1, a1], [c2, a2]] = open;
        open = [];
        await sleep(750);
        if (!alive(tok)) return;
        if (a1 === a2) {
          c1.classList.add('done');
          c2.classList.add('done');
          c1.classList.remove('open');
          c2.classList.remove('open');
          found++;
          Sfx.good();
          if (found === pairs) {
            await celebrate(null, { say: false });
            await speak(sapa(line('mem-done', ['Wah, semua kartunya sudah ketemu. Ingatanmu hebat!', 'Selesai! Kamu jago sekali mengingat.'])));
            await sleep(1000, tok) && start();
          } else {
            await speak(line('mem-match', ['Cocok! Dua-duanya ' + a1[1].toLowerCase() + '.', 'Yes, sama!', 'Pintar, ketemu pasangannya.']));
          }
        } else {
          misses++;
          await sleep(450);
          c1.classList.remove('open');
          c2.classList.remove('open');
          if (misses % 3 === 0) speak(line('mem-miss', ['Belum sama. Coba ingat-ingat tadi gambarnya di mana, ya.', 'Hmm, beda. Tidak apa-apa, coba lagi.']));
        }
        lock = false;
      });
      grid.append(c);
    });
    speak(firstGame
      ? 'Buka dua kartu. Kalau gambarnya sama, kartunya jadi milik kamu. Coba ingat-ingat letaknya, ya.'
      : 'Main lagi, yuk!');
    firstGame = false;
  }
  start();
};

/* ================= Pecah balon (untuk si kecil) ================= */
const BALLOON_MODES = {
  angka: () => { const n = rand(10) + 1; return [String(n), () => speak(cap(numWord(n)) + '!', 'id-ID', 1, { show: String(n) + ' — ' + numWord(n) })]; },
  huruf: () => { const [L, w] = pick(ABC); return [L, () => speak(cap(ABC_SAY[L]) + ', ' + w.toLowerCase() + '.', 'id-ID', 1, { show: L + ' — ' + w })]; },
  hijaiyah: () => { const L = pick(HIJAIYAH); return [L.ch, () => sayArab(L.say, L.ch + ' — ' + L.name), true]; },
  warna: () => ['', null],
};

Screens['balloon'] = (root, params, tok) => {
  let mode = Store.get('balloonMode', 'angka');
  root.append(topbar('Pecah Balon'), coach(''),
    segmented([['angka', '1 2 3'], ['huruf', 'A B C'], ['hijaiyah', 'ا ب ت'], ['warna', 'Warna']], mode, (v) => { mode = v; Store.set('balloonMode', v); }));
  const sky = h('div', { class: 'sky' },
    h('div', { class: 'cloud c1' }), h('div', { class: 'cloud c2' }), h('div', { class: 'cloud c3' }));
  root.append(sky);
  let popped = 0;
  const balloons = [];
  let lastSpawn = 0;
  let raf = 0;

  function spawn() {
    const w = sky.clientWidth;
    const hgt = sky.clientHeight;
    if (!w) return;
    const [name, color] = COLOR_LIST[rand(8)];
    let [label, sayFn, arab] = BALLOON_MODES[mode]();
    if (mode === 'warna') sayFn = () => speak('Warna ' + name.toLowerCase() + '!', 'id-ID', 1, { show: name });
    const x0 = Math.random() * Math.max(0, w - 92);
    const el = h('button', {
      class: 'balloon' + (arab ? ' arab' : ''),
      'aria-label': 'Balon',
      style: { '--b': color, transform: `translate(${x0}px, ${hgt}px)` },
    }, h('span', null, label));
    const b = { el, y: hgt, speed: 0.55 + Math.random() * 0.6, x0, t: Math.random() * 6 };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (b.dead) return;
      el.classList.add('pop');
      Sfx.pop();
      sayFn();
      popped++;
      if (popped % 10 === 0) {
        celebrate(null, { say: false });
        speak(sapa(line('balloon', ['Wah, sudah ' + numWord(popped) + ' balon!', 'Hebat, balonnya pecah terus!'])));
      }
      setTimeout(() => el.remove(), 260);
      b.dead = true;
    });
    sky.append(el);
    balloons.push(b);
  }

  function loop(ts) {
    if (!alive(tok)) return;
    if (ts - lastSpawn > 1150 && balloons.length < 7) { spawn(); lastSpawn = ts; }
    for (let k = balloons.length - 1; k >= 0; k--) {
      const b = balloons[k];
      if (!b.dead) {
        b.y -= b.speed;
        b.t += 0.03;
        b.el.style.transform = `translate(${b.x0 + Math.sin(b.t) * 12}px, ${b.y}px)`;
      }
      if (b.dead || b.y < -140) {
        if (!b.dead) b.el.remove();
        balloons.splice(k, 1);
      }
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  speak(sapa('Lihat, banyak balon! Ayo pecahkan satu-satu.'));
  return () => cancelAnimationFrame(raf);
};
