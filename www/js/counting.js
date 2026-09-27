/* Belajar bersama Zayn — Berhitung: pelan, detail, satu per satu, dipandu seperti guru */
'use strict';

const PAD_COLORS = ['#FF7A59', '#FFB23F', '#34C3A0', '#4DA3FF', '#8C7CFF', '#FF7EB6', '#2FB6C9', '#F2994A'];
const FOODS = new Set(['apel', 'pisang', 'stroberi', 'kue', 'jeruk']);

/** Jeda dasar antarlangkah, dikalikan pengaturan kecepatan (1 = normal, 2 = sangat pelan). */
const step = (ms) => ms * Settings.slow;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function objEl(emoji, extraClass = '') {
  return h('div', { class: 'obj ' + extraClass }, emoji);
}

/** Kotak sepuluh (ten-frame) untuk memperlihatkan jumlah secara visual. */
function tenFrame(n, max = 10) {
  const rows = Math.min(Math.ceil(Math.max(n, 1) / 10), Math.ceil(max / 10));
  const wrap = h('div', { class: 'tenframe' });
  for (let r = 0; r < rows; r++) {
    const row = h('div', { class: 'tf-row' });
    for (let i = 0; i < 10; i++) {
      const k = r * 10 + i;
      row.append(h('div', { class: 'tf' + (k < n ? ' on' : '') + (i === 5 ? ' gap' : ''), style: { animationDelay: k * 50 + 'ms' } }));
    }
    wrap.append(row);
  }
  return wrap;
}

/**
 * Hitung bersama: sorot benda satu per satu, beri nomor, dan ucapkan angkanya perlahan.
 * Mengembalikan false bila pengguna sudah pindah layar.
 */
async function countAlong(els, tok, { wordEl, start = 1, delay = 1000 } = {}) {
  for (let i = 0; i < els.length; i++) {
    if (!alive(tok)) return false;
    const el = els[i];
    const n = start + i;
    el.classList.remove('hidden');
    el.classList.add('now', 'counted');
    let tag = el.querySelector('.tag');
    if (!tag) { tag = h('span', { class: 'tag' }); el.append(tag); }
    tag.textContent = n;
    if (wordEl) wordEl.textContent = numWord(n);
    Sfx.count(n);
    await Promise.all([speak(cap(numWord(n)) + '.', 'id-ID', 1, { show: cap(numWord(n)) + '…', key: numKey(n) }), sleep(step(delay))]);
    el.classList.remove('now');
  }
  return alive(tok);
}

function makeChoices(correct, min, max, count = 3) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < Math.min(count, max - min + 1) && guard++ < 100) {
    const d = pick([-2, -1, 1, 2, rand(max - min + 1) + min - correct]);
    const v = correct + d;
    if (v >= min && v <= max) set.add(v);
  }
  return shuffle([...set]);
}

/**
 * Baris tombol jawaban. Tombol langsung ditandai benar/salah, lalu onRight/onWrong dijalankan.
 * Selama handler berjalan, tombol lain dikunci agar anak tidak menekan berulang-ulang.
 */
function numberChoices(values, correct, onRight, onWrong, cls = '') {
  const row = h('div', { class: 'choices' });
  let busy = false;
  values.forEach((v) => {
    const b = h('button', { class: 'choice ' + cls }, v);
    b.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      Sfx.tap();
      if (v === correct) {
        b.classList.add('right');
        await onRight(v);
      } else {
        b.classList.add('wrong');
        setTimeout(() => b.classList.remove('wrong'), 500);
        await onWrong(v);
        busy = false;
      }
    });
    row.append(b);
  });
  return row;
}

function clearTags(els) {
  els.forEach((e) => { e.classList.remove('counted', 'gone'); const t = e.querySelector('.tag'); if (t) t.remove(); });
}

/* ================= Menu berhitung ================= */
Screens['count-menu'] = (root) => {
  root.append(topbar('Berhitung'), coach(''), menuGrid([
    ['count-learn', {}, 'eye', 'Kenal Angka', 'Lihat & dengarkan', '#FFE9D6'],
    ['count-tap', {}, 'finger', 'Hitung Sendiri', 'Sentuh satu-satu', '#E3F8EF'],
    ['count-quiz', {}, 'think', 'Ada Berapa?', 'Tebak jumlahnya', '#DCEBFF'],
    ['count-add', {}, 'plus', 'Penjumlahan', 'Usia 5 tahun ke atas', '#EFEAFF'],
    ['count-sub', {}, 'minus', 'Pengurangan', 'Usia 5 tahun ke atas', '#FFE4EF'],
    ['count-order', {}, 'order', 'Urutan Angka', 'Angka yang hilang', '#E0F7F2'],
  ]));
  speak(sapa(line('count-menu', [
    'Ayo kita belajar berhitung. Mau mulai dari mana?',
    'Hari ini kita main angka, yuk. Pilih salah satu, ya.',
    'Berhitung itu seru, lho. Kamu mau yang mana?',
  ])));
};

/* ================= Kenal Angka: pilih angka lalu dihitung perlahan ================= */
Screens['count-learn'] = (root) => {
  let max = Store.get('learnMax', 10);
  const pad = h('div', { class: 'num-pad' });
  const renderPad = () => {
    pad.innerHTML = '';
    for (let i = 1; i <= max; i++) {
      pad.append(h('button', {
        style: { '--c': PAD_COLORS[(i - 1) % PAD_COLORS.length] },
        onclick: () => { Sfx.tap(); go('count-show', { n: i, max }); },
      }, i));
    }
  };
  root.append(
    topbar('Kenal Angka'),
    coach(''),
    segmented([[5, '1 – 5'], [10, '1 – 10'], [20, '1 – 20']], max, (v) => { max = v; Store.set('learnMax', v); renderPad(); }),
    pad
  );
  renderPad();
  speak('Pilih satu angka. Nanti kita hitung pelan-pelan, sama-sama.');
};

Screens['count-show'] = (root, { n, max = 10 }, tok) => {
  const [emoji, name] = COUNT_THINGS[(n - 1) % COUNT_THINGS.length];
  const numEl = h('div', { class: 'big-number' }, n);
  const wordEl = h('div', { class: 'big-word' }, '');
  const objs = h('div', { class: 'objects' });
  const els = [];
  for (let i = 0; i < n; i++) { const e = objEl(emoji, 'hidden'); els.push(e); objs.append(e); }
  const frame = h('div', { class: 'frame-slot' });
  const actions = h('div', { class: 'row actions', style: { visibility: 'hidden' } },
    h('button', { class: 'btn ghost', onclick: () => go('count-show', { n, max }, { replace: true }) }, icon('replay', 22), 'Ulangi'),
    h('button', { class: 'btn warm', onclick: () => go('count-tap', { n }) }, icon('pencil', 22), 'Aku coba'),
    n < max ? h('button', { class: 'btn', onclick: () => go('count-show', { n: n + 1, max }, { replace: true }) }, 'Angka ' + (n + 1), icon('next', 22)) : null
  );
  root.append(topbar('Angka ' + n), coach(''), h('div', { class: 'stage' }, numEl, wordEl, objs, frame, actions));

  (async () => {
    await Promise.all([speak('Coba lihat. Ini angka ' + numWord(n) + '.'), sleep(step(1500))]);
    if (!alive(tok)) return;
    const intro = n === 1
      ? 'Sekarang kita hitung ' + name + 'nya, ya.'
      : line('count-intro', [
        'Sekarang kita hitung ' + name + 'nya bareng-bareng. Pakai jari, tunjuk satu-satu, ya.',
        'Yuk, kita hitung ' + name + 'nya pelan-pelan. Ikut bilang, ya.',
        'Siap? Kita hitung sama-sama, jangan buru-buru.',
      ]);
    await Promise.all([speak(intro), sleep(step(1600))]);
    if (!alive(tok)) return;
    for (const e of els) e.classList.add('show');
    if (!(await countAlong(els, tok, { wordEl, delay: 1150 }))) return;
    wordEl.textContent = numWord(n) + ' ' + name;
    frame.append(tenFrame(n, max));
    numEl.classList.add('bounce');
    const outro = n === 1
      ? 'Cuma ada satu ' + name + '. Jadi, angka satu artinya ada satu benda.'
      : 'Semuanya ada ' + numWord(n) + ' ' + name + '. Jadi, angka ' + numWord(n) + ' artinya ada ' + numWord(n) + ' benda.';
    await Promise.all([speak(outro), sleep(step(1200))]);
    if (!alive(tok)) return;
    actions.style.visibility = 'visible';
    addStar();
    await speak(sapa(n < max
      ? line('count-next', ['Pintar! Mau lanjut ke angka ' + numWord(n + 1) + '?', 'Bagus. Sekarang mau coba sendiri, atau lanjut ke angka berikutnya?'])
      : 'Hebat, kamu sudah sampai angka ' + numWord(n) + '!'));
  })();
};

/* ================= Hitung Sendiri: anak menyentuh tiap benda ================= */
Screens['count-tap'] = (root, params, tok) => {
  let level = Store.get('tapLevel', 5);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Hitung Sendiri'), coach(''),
    segmented([[3, 'Mudah'], [5, 'Sedang'], [10, 'Sulit'], [20, 'Jago']], level, (v) => { level = v; Store.set('tapLevel', v); round(); }),
    body);

  let fixedN = params.n || null;
  let first = true;
  function round() {
    if (!alive(tok)) return;
    const n = fixedN || (rand(level) + 1);
    fixedN = null;
    const [emoji, name] = pick(COUNT_THINGS);
    body.innerHTML = '';
    const wordEl = h('div', { class: 'big-word' }, '');
    const objs = h('div', { class: 'objects' });
    const answer = h('div');
    let counted = 0;
    for (let i = 0; i < n; i++) {
      const e = objEl(emoji, 'show tappable');
      e.addEventListener('click', async () => {
        if (e.classList.contains('counted')) {
          Sfx.soft();
          speak(line('counted', ['Yang itu sudah dihitung. Cari yang belum, ya.', 'Eh, itu sudah. Yang lain mana?']));
          return;
        }
        counted++;
        e.classList.add('counted');
        e.append(h('span', { class: 'tag' }, counted));
        wordEl.textContent = numWord(counted);
        Sfx.count(counted);
        speak(cap(numWord(counted)) + '.', 'id-ID', 1, { show: cap(numWord(counted)) + '…', key: numKey(counted) });
        if (counted === n) {
          await sleep(step(1100));
          if (!alive(tok)) return;
          ask();
        }
      });
      objs.append(e);
    }
    body.append(objs, wordEl, answer);
    speak(first
      ? 'Sekarang giliran kamu. Sentuh ' + name + 'nya satu per satu sambil ikut menghitung, ya.'
      : line('tap-intro', ['Ayo, hitung ' + name + 'nya.', 'Ada ' + name + ' lagi, nih. Sentuh satu-satu, ya.', 'Coba hitung yang ini.']));
    first = false;

    async function ask() {
      await speak(line('tap-ask', ['Nah, sudah semua. Jadi, ada berapa ' + name + '?', 'Sudah selesai. Ada berapa ' + name + ' semuanya?']));
      if (!alive(tok)) return;
      answer.append(numberChoices(makeChoices(n, 1, Math.max(level, n)), n, async () => {
        await celebrate();
        if (!alive(tok)) return;
        await speak('Iya, ada ' + numWord(n) + ' ' + name + '.');
        await sleep(step(800), tok) && round();
      }, async () => {
        await tryAgain('Hmm, belum pas. Coba lihat nomor yang paling terakhir kamu sentuh tadi.');
      }));
    }
  }
  round();
};

/* ================= Ada Berapa? Tebak jumlah (dengan bantuan hitung bila salah) ================= */
Screens['count-quiz'] = (root, params, tok) => {
  let level = Store.get('quizLevel', 5);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Ada Berapa?'), coach(''),
    segmented([[5, '1 – 5'], [10, '1 – 10'], [20, '1 – 20']], level, (v) => { level = v; Store.set('quizLevel', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const n = rand(level) + 1;
    const [emoji, name] = pick(COUNT_THINGS);
    body.innerHTML = '';
    const objs = h('div', { class: 'objects' });
    const els = [];
    for (let i = 0; i < n; i++) { const e = objEl(emoji, 'show'); els.push(e); objs.append(e); }
    const wordEl = h('div', { class: 'big-word' });
    let helping = false;
    const help = async () => {
      if (helping) return;
      helping = true;
      clearTags(els);
      await speak('Kita hitung bareng, ya.');
      if (await countAlong(els, tok, { wordEl, delay: 950 })) {
        await speak('Tuh, ada ' + numWord(n) + '. Sekarang coba pilih angkanya.');
      }
      helping = false;
    };
    body.append(
      objs, wordEl,
      numberChoices(makeChoices(n, 1, level, level <= 5 ? 3 : 4), n, async () => {
        await celebrate();
        await sleep(step(600), tok) && round();
      }, async () => {
        await tryAgain('Belum pas. Tidak apa-apa, kita hitung pelan-pelan, yuk.');
        await help();
      }),
      h('button', { class: 'btn ghost', onclick: help }, icon('search', 22), 'Bantu hitung')
    );
    speak(line('quiz-ask', [
      'Coba hitung dalam hati. Ada berapa ' + name + ' di sini?',
      'Ada berapa ' + name + ', ya?',
      'Hitung ' + name + 'nya, lalu pilih angka yang benar.',
    ]));
  }
  round();
};

/* ================= Penjumlahan ================= */
Screens['count-add'] = (root, params, tok) => {
  let max = Store.get('addMax', 5);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Penjumlahan'), coach(''),
    segmented([[5, 'Sampai 5'], [10, 'Sampai 10'], [20, 'Sampai 20']], max, (v) => { max = v; Store.set('addMax', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const total = rand(max - 1) + 2;
    const a = rand(total - 1) + 1;
    const b = total - a;
    const [emoji, name] = pick(COUNT_THINGS);
    body.innerHTML = '';
    const gA = h('div', { class: 'group' });
    const gB = h('div', { class: 'group' });
    const els = [];
    for (let i = 0; i < a; i++) { const e = objEl(emoji, 'show'); els.push(e); gA.append(e); }
    for (let i = 0; i < b; i++) { const e = objEl(emoji, 'show'); els.push(e); gB.append(e); }
    const q = h('span', { class: 'q' }, '?');
    const wordEl = h('div', { class: 'big-word' });
    body.append(
      h('div', { class: 'equation' }, gA, h('span', { class: 'op' }, '+'), gB),
      h('div', { class: 'equation text' }, a, h('span', { class: 'op' }, '+'), b, h('span', { class: 'op' }, '='), q),
      wordEl
    );
    let helping = false;
    const help = async () => {
      if (helping) return;
      helping = true;
      clearTags(els);
      await Promise.all([speak('Kita hitung yang kiri dulu, ya.'), sleep(step(1100))]);
      if (!(await countAlong(els.slice(0, a), tok, { wordEl, delay: 900 }))) { helping = false; return; }
      await Promise.all([speak('Sekarang yang kanan. Jangan mulai dari satu lagi, ya. Kita lanjutkan dari ' + numWord(a) + '.'), sleep(step(1500))]);
      if (!(await countAlong(els.slice(a), tok, { wordEl, start: a + 1, delay: 900 }))) { helping = false; return; }
      await speak('Jadi semuanya ada ' + numWord(total) + '.');
      helping = false;
    };
    body.append(
      numberChoices(makeChoices(total, 1, max, 3), total, async () => {
        q.textContent = total;
        await celebrate();
        if (!alive(tok)) return;
        await speak(cap(numWord(a)) + ' tambah ' + numWord(b) + ', sama dengan ' + numWord(total) + '.');
        await sleep(step(800), tok) && round();
      }, async () => {
        await tryAgain('Hampir! Ayo kita hitung bareng.');
        await help();
      }),
      h('button', { class: 'btn ghost', onclick: help }, icon('search', 22), 'Bantu hitung')
    );
    speak('Ini ada ' + numWord(a) + ' ' + name + '. Lalu datang ' + numWord(b) + ' ' + name + ' lagi. Kalau dikumpulkan, jadi berapa, ya?');
  }
  round();
};

/* ================= Pengurangan ================= */
Screens['count-sub'] = (root, params, tok) => {
  let max = Store.get('subMax', 5);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Pengurangan'), coach(''),
    segmented([[5, 'Sampai 5'], [10, 'Sampai 10'], [20, 'Sampai 20']], max, (v) => { max = v; Store.set('subMax', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const a = rand(max - 1) + 2;
    const b = rand(a - 1) + 1;
    const res = a - b;
    const [emoji, name] = pick(COUNT_THINGS);
    const verb = FOODS.has(name) ? 'dimakan' : 'diambil';
    body.innerHTML = '';
    const objs = h('div', { class: 'objects' });
    const els = [];
    for (let i = 0; i < a; i++) { const e = objEl(emoji, 'show'); els.push(e); objs.append(e); }
    const q = h('span', { class: 'q' }, '?');
    const wordEl = h('div', { class: 'big-word' });
    body.append(objs, h('div', { class: 'equation text' }, a, h('span', { class: 'op' }, '−'), b, h('span', { class: 'op' }, '='), q), wordEl);

    let helping = false;
    const help = async () => {
      if (helping) return;
      helping = true;
      clearTags(els);
      await Promise.all([speak('Tadi ada ' + numWord(a) + ' ' + name + '. Kita ' + (verb === 'dimakan' ? 'makan' : 'ambil') + ' ' + numWord(b) + ', ya.'), sleep(step(1700))]);
      const taken = els.slice(a - b);
      for (let i = 0; i < taken.length; i++) {
        if (!alive(tok)) return;
        taken[i].classList.add('gone');
        Sfx.pop();
        wordEl.textContent = verb + ' ' + numWord(i + 1);
        await Promise.all([speak(cap(numWord(i + 1)) + '.', 'id-ID', 1, { key: numKey(i + 1) }), sleep(step(1000))]);
      }
      await Promise.all([speak('Sekarang kita hitung yang masih ada.'), sleep(step(1100))]);
      if (!(await countAlong(els.slice(0, res), tok, { wordEl, delay: 900 }))) { helping = false; return; }
      await speak(res === 0 ? 'Wah, habis. Tidak ada yang tersisa.' : 'Sisanya ' + numWord(res) + '.');
      helping = false;
    };
    body.append(
      numberChoices(makeChoices(res, 0, max, 3), res, async () => {
        q.textContent = res;
        await celebrate();
        if (!alive(tok)) return;
        await speak(cap(numWord(a)) + ' kurang ' + numWord(b) + ', sama dengan ' + numWord(res) + '.');
        await sleep(step(800), tok) && round();
      }, async () => {
        await tryAgain('Hampir! Ayo kita lihat pelan-pelan.');
        await help();
      }),
      h('button', { class: 'btn ghost', onclick: help }, icon('search', 22), 'Bantu hitung')
    );
    speak('Ada ' + numWord(a) + ' ' + name + '. Terus, ' + numWord(b) + ' ' + name + ' ' + verb + '. Sisa berapa, ya?');
  }
  round();
};

/* ================= Urutan Angka: angka berapa yang hilang? ================= */
Screens['count-order'] = (root, params, tok) => {
  let max = Store.get('orderMax', 10);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Urutan Angka'), coach(''),
    segmented([[10, '1 – 10'], [20, '1 – 20'], [50, '1 – 50'], [100, '1 – 100']], max, (v) => { max = v; Store.set('orderMax', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const start = rand(max - 3) + 1;
    const missing = rand(3) + 1; // posisi yang kosong (1..3)
    const seq = [start, start + 1, start + 2, start + 3];
    const ans = seq[missing];
    body.innerHTML = '';
    const boxes = h('div', { class: 'seq' });
    const cells = seq.map((v, i) => {
      const c = h('div', { class: 'seq-cell' + (i === missing ? ' empty' : '') }, i === missing ? '?' : v);
      boxes.append(c);
      return c;
    });
    body.append(
      boxes,
      numberChoices(makeChoices(ans, 1, max, 3), ans, async () => {
        cells[missing].textContent = ans;
        cells[missing].classList.remove('empty');
        await celebrate();
        if (!alive(tok)) return;
        await speak('Kita baca sama-sama, ya.');
        for (let i = 0; i < seq.length; i++) {
          cells[i].classList.add('lit');
          await Promise.all([speak(cap(numWord(seq[i])) + '.', 'id-ID', 1, { key: numKey(seq[i]) }), sleep(step(650))]);
          if (!alive(tok)) return;
        }
        await sleep(step(500), tok) && round();
      }, async () => {
        await tryAgain('Coba hitung dari ' + numWord(seq[0]) + ', pelan-pelan. ' + seq.slice(0, missing).map(numWord).join(', ') + ', lalu?');
      })
    );
    speak('Coba baca angkanya. ' + seq.map((v, i) => (i === missing ? 'hmm' : numWord(v))).join(', ') + '. Angka apa yang hilang?');
  }
  round();
};
