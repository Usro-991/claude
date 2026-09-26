/* Dunia Ceria — Berhitung: pelan, detail, satu per satu */
'use strict';

const PAD_COLORS = ['#FF5A5F', '#FF8A3D', '#FFB938', '#5CC85C', '#2EC4B6', '#3FA9F5', '#9B6BFF', '#FF7EB6'];

/** Jeda dasar antarlangkah, dikalikan pengaturan kecepatan (1 = normal, 1.5 = sangat pelan). */
const step = (ms) => ms * Settings.slow;

function objEl(emoji, extraClass = '') {
  return h('div', { class: 'obj ' + extraClass }, emoji);
}

/** Tampilkan 10 kotak (ten-frame) untuk memperlihatkan jumlah secara visual. */
function tenFrame(n, max = 10) {
  const rows = Math.ceil(Math.max(n, 1) / 10);
  const wrap = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' } });
  for (let r = 0; r < Math.min(rows, Math.ceil(max / 10)); r++) {
    const row = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' } });
    for (let i = 0; i < 10; i++) {
      const k = r * 10 + i;
      row.append(h('div', {
        class: 'tf',
        style: {
          width: '22px', height: '22px', borderRadius: '50%',
          background: k < n ? PAD_COLORS[(r * 2 + (i < 5 ? 0 : 1)) % PAD_COLORS.length] : 'rgba(0,0,0,.08)',
          marginLeft: i === 5 ? '8px' : '0',
        },
      }));
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
    await Promise.all([speak(numWord(n)), sleep(step(delay))]);
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

/* ================= Menu berhitung ================= */
Screens['count-menu'] = (root) => {
  root.append(topbar('Berhitung 🔢'));
  const items = [
    ['count-learn', '👀', 'Kenal Angka', 'Lihat & dengar', 'var(--orange)', '1-7 th'],
    ['count-tap', '👆', 'Hitung Sendiri', 'Sentuh satu-satu', 'var(--green)', '2-7 th'],
    ['count-quiz', '🤔', 'Ada Berapa?', 'Tebak jumlah', 'var(--blue)', '3-7 th'],
    ['count-add', '➕', 'Penjumlahan', 'Tambah benda', 'var(--purple)', '5-7 th'],
    ['count-sub', '➖', 'Pengurangan', 'Ambil benda', 'var(--pink)', '5-7 th'],
    ['count-order', '🔢', 'Urutan Angka', 'Angka berikutnya', 'var(--teal)', '4-7 th'],
  ];
  const grid = h('div', { class: 'grid' });
  items.forEach(([screen, ico, name, , color, age]) => {
    grid.append(h('button', {
      class: 'tile', style: { background: color },
      onclick: () => { Sfx.tap(); go(screen); },
    }, h('div', { class: 'ico' }, ico), h('div', { class: 'name' }, name), h('div', { class: 'age' }, age)));
  });
  root.append(grid);
};

/* ================= Kenal Angka: pilih angka lalu dihitung perlahan ================= */
Screens['count-learn'] = (root) => {
  root.append(topbar('Kenal Angka'));
  let max = Store.get('learnMax', 10);
  const pad = h('div', { class: 'num-pad' });
  const renderPad = () => {
    pad.innerHTML = '';
    for (let i = 1; i <= max; i++) {
      pad.append(h('button', {
        style: { background: PAD_COLORS[(i - 1) % PAD_COLORS.length] },
        onclick: () => { Sfx.tap(); go('count-show', { n: i, max }); },
      }, i));
    }
  };
  root.append(
    segmented([[5, '1 - 5'], [10, '1 - 10'], [20, '1 - 20']], max, (v) => { max = v; Store.set('learnMax', v); renderPad(); }),
    h('p', { class: 'hint' }, 'Pilih angka, lalu kita hitung pelan-pelan bersama 😊'),
    pad
  );
  renderPad();
};

Screens['count-show'] = (root, { n, max = 10 }, tok) => {
  const [emoji, name] = COUNT_THINGS[(n - 1) % COUNT_THINGS.length];
  root.append(topbar('Angka ' + n, { sayTitle: false }));
  const numEl = h('div', { class: 'big-number' }, n);
  const wordEl = h('div', { class: 'big-word' }, '');
  const objs = h('div', { class: 'objects' });
  const els = [];
  for (let i = 0; i < n; i++) { const e = objEl(emoji, 'hidden'); els.push(e); objs.append(e); }
  const frame = h('div', { style: { minHeight: '30px' } });
  const actions = h('div', { class: 'row', style: { visibility: 'hidden' } },
    h('button', { class: 'big-btn alt', onclick: () => go('count-show', { n, max }, { replace: true }) }, '🔁 Ulangi'),
    n < max ? h('button', { class: 'big-btn', onclick: () => go('count-show', { n: n + 1, max }, { replace: true }) }, 'Angka ' + (n + 1) + ' ➡️') : null,
    h('button', { class: 'big-btn warn', onclick: () => go('count-tap', { n }) }, '👆 Aku coba')
  );
  root.append(h('div', { class: 'center' }, numEl, wordEl, objs, frame, actions));

  (async () => {
    numEl.style.animation = 'appear .6s';
    await Promise.all([speak('Ini angka ' + numWord(n)), sleep(step(1600))]);
    if (!alive(tok)) return;
    await Promise.all([speak('Ayo kita hitung ' + name + ' pelan-pelan'), sleep(step(1800))]);
    if (!alive(tok)) return;
    for (const e of els) e.classList.add('show');
    if (!(await countAlong(els, tok, { wordEl, delay: 1100 }))) return;
    wordEl.textContent = numWord(n) + ' ' + name;
    frame.append(tenFrame(n, max));
    numEl.style.animation = 'none'; void numEl.offsetWidth; numEl.style.animation = 'bounce .6s 2';
    await Promise.all([speak('Jadi, ada ' + numWord(n) + ' ' + name + '. Angka ' + numWord(n) + '!'), sleep(step(1500))]);
    if (!alive(tok)) return;
    actions.style.visibility = 'visible';
    addStar();
  })();
};

/* ================= Hitung Sendiri: anak menyentuh tiap benda ================= */
Screens['count-tap'] = (root, params, tok) => {
  let level = Store.get('tapLevel', 5);
  const body = h('div', { class: 'center' });
  root.append(topbar('Hitung Sendiri'),
    segmented([[3, 'Mudah'], [5, 'Sedang'], [10, 'Sulit'], [20, 'Jago']], level, (v) => { level = v; Store.set('tapLevel', v); round(); }),
    body);

  let fixedN = params.n || null;
  function round() {
    if (!alive(tok)) return;
    const n = fixedN || (rand(level) + 1);
    fixedN = null;
    const [emoji, name] = pick(COUNT_THINGS);
    body.innerHTML = '';
    const wordEl = h('div', { class: 'big-word' }, '');
    const objs = h('div', { class: 'objects' });
    const prompt = h('div', { class: 'prompt' }, 'Sentuh setiap ' + name + ' sambil menghitung');
    const answer = h('div');
    let counted = 0;
    for (let i = 0; i < n; i++) {
      const e = objEl(emoji, 'show');
      e.addEventListener('click', async () => {
        if (e.classList.contains('counted')) { Sfx.soft(); return; }
        counted++;
        e.classList.add('counted');
        e.append(h('span', { class: 'tag' }, counted));
        wordEl.textContent = numWord(counted);
        Sfx.count(counted);
        speak(numWord(counted));
        if (counted === n) {
          await sleep(step(1200));
          if (!alive(tok)) return;
          ask();
        }
      });
      objs.append(e);
    }
    body.append(prompt, objs, wordEl, answer);
    speak('Sentuh setiap ' + name + ' sambil menghitung, ya');

    async function ask() {
      prompt.textContent = 'Ada berapa ' + name + '?';
      await speak('Ada berapa ' + name + '?');
      if (!alive(tok)) return;
      answer.append(numberChoices(makeChoices(n, 1, Math.max(level, n)), n, async () => {
        await celebrate();
        if (!alive(tok)) return;
        await speak('Ya, ada ' + numWord(n) + ' ' + name);
        await sleep(step(900), tok) && round();
      }, async (v) => {
        tryAgain('Hitung lagi, yuk. Itu ' + numWord(v) + '. Ayo lihat nomornya.');
      }));
    }
  }
  round();
};

/* ================= Ada Berapa? Tebak jumlah (dengan bantuan hitung bila salah) ================= */
Screens['count-quiz'] = (root, params, tok) => {
  let level = Store.get('quizLevel', 5);
  const body = h('div', { class: 'center' });
  root.append(topbar('Ada Berapa?'),
    segmented([[5, '1 - 5'], [10, '1 - 10'], [20, '1 - 20']], level, (v) => { level = v; Store.set('quizLevel', v); round(); }),
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
      els.forEach((e) => { e.classList.remove('counted'); const t = e.querySelector('.tag'); if (t) t.remove(); });
      await speak('Ayo hitung bersama');
      await countAlong(els, tok, { wordEl, delay: 900 });
      helping = false;
    };
    body.append(
      h('div', { class: 'prompt' }, 'Ada berapa ' + name + '?'),
      objs, wordEl,
      numberChoices(makeChoices(n, 1, level, level <= 5 ? 3 : 4), n, async () => {
        await celebrate();
        await sleep(step(700), tok) && round();
      }, async (v) => {
        await tryAgain('Belum tepat. Kita hitung pelan-pelan, ya');
        await help();
      }),
      h('button', { class: 'big-btn alt', onclick: help }, '🔍 Bantu hitung')
    );
    speak('Ada berapa ' + name + '?');
  }
  round();
};

/* ================= Penjumlahan ================= */
Screens['count-add'] = (root, params, tok) => {
  let max = Store.get('addMax', 5);
  const body = h('div', { class: 'center' });
  root.append(topbar('Penjumlahan'),
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
    const q = h('span', null, '?');
    const wordEl = h('div', { class: 'big-word' });
    body.append(
      h('div', { class: 'equation' }, gA, h('span', null, '+'), gB),
      h('div', { class: 'equation' }, a, ' + ', b, ' = ', q),
      wordEl
    );
    let helping = false;
    const help = async () => {
      if (helping) return;
      helping = true;
      els.forEach((e) => { e.classList.remove('counted'); const t = e.querySelector('.tag'); if (t) t.remove(); });
      await Promise.all([speak('Ada ' + numWord(a) + ' ' + name), sleep(step(1200))]);
      if (!(await countAlong(els.slice(0, a), tok, { wordEl, delay: 850 }))) { helping = false; return; }
      await Promise.all([speak('Ditambah ' + numWord(b) + ' lagi. Kita lanjut hitung'), sleep(step(1400))]);
      if (!(await countAlong(els.slice(a), tok, { wordEl, start: a + 1, delay: 850 }))) { helping = false; return; }
      await speak('Semuanya ada ' + numWord(total));
      helping = false;
    };
    body.append(
      numberChoices(makeChoices(total, 1, max, 3), total, async () => {
        q.textContent = total;
        await celebrate();
        if (!alive(tok)) return;
        await speak(numWord(a) + ' tambah ' + numWord(b) + ' sama dengan ' + numWord(total));
        await sleep(step(900), tok) && round();
      }, async (v) => {
        await tryAgain('Hampir! Ayo hitung bersama');
        await help();
      }),
      h('button', { class: 'big-btn alt', onclick: help }, '🔍 Bantu hitung')
    );
    speak(numWord(a) + ' ' + name + ' ditambah ' + numWord(b) + ' ' + name + '. Jadi berapa?');
  }
  round();
};

/* ================= Pengurangan ================= */
Screens['count-sub'] = (root, params, tok) => {
  let max = Store.get('subMax', 5);
  const body = h('div', { class: 'center' });
  root.append(topbar('Pengurangan'),
    segmented([[5, 'Sampai 5'], [10, 'Sampai 10'], [20, 'Sampai 20']], max, (v) => { max = v; Store.set('subMax', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const a = rand(max - 1) + 2;
    const b = rand(a - 1) + 1;
    const res = a - b;
    const [emoji, name] = pick(COUNT_THINGS);
    body.innerHTML = '';
    const objs = h('div', { class: 'objects' });
    const els = [];
    for (let i = 0; i < a; i++) { const e = objEl(emoji, 'show'); els.push(e); objs.append(e); }
    const q = h('span', null, '?');
    const wordEl = h('div', { class: 'big-word' });
    body.append(objs, h('div', { class: 'equation' }, a, ' − ', b, ' = ', q), wordEl);

    let helping = false;
    const help = async () => {
      if (helping) return;
      helping = true;
      els.forEach((e) => { e.classList.remove('counted', 'gone'); const t = e.querySelector('.tag'); if (t) t.remove(); });
      await Promise.all([speak('Ada ' + numWord(a) + ' ' + name + '. Kita ambil ' + numWord(b)), sleep(step(1800))]);
      const taken = els.slice(a - b);
      for (let i = 0; i < taken.length; i++) {
        if (!alive(tok)) return;
        taken[i].classList.add('gone');
        Sfx.pop();
        wordEl.textContent = 'ambil ' + numWord(i + 1);
        await Promise.all([speak('ambil ' + numWord(i + 1)), sleep(step(1000))]);
      }
      await Promise.all([speak('Sisanya kita hitung'), sleep(step(1100))]);
      if (!(await countAlong(els.slice(0, res), tok, { wordEl, delay: 850 }))) { helping = false; return; }
      await speak('Sisa ' + numWord(res));
      helping = false;
    };
    body.append(
      numberChoices(makeChoices(res, 0, max, 3), res, async () => {
        q.textContent = res;
        await celebrate();
        if (!alive(tok)) return;
        await speak(numWord(a) + ' kurang ' + numWord(b) + ' sama dengan ' + numWord(res));
        await sleep(step(900), tok) && round();
      }, async (v) => {
        await tryAgain('Hampir! Ayo kita lihat pelan-pelan');
        await help();
      }),
      h('button', { class: 'big-btn alt', onclick: help }, '🔍 Bantu hitung')
    );
    speak('Ada ' + numWord(a) + ' ' + name + ', diambil ' + numWord(b) + '. Sisa berapa?');
  }
  round();
};

/* ================= Urutan Angka: angka berapa sesudahnya? ================= */
Screens['count-order'] = (root, params, tok) => {
  let max = Store.get('orderMax', 10);
  const body = h('div', { class: 'center' });
  root.append(topbar('Urutan Angka'),
    segmented([[10, '1 - 10'], [20, '1 - 20'], [50, '1 - 50'], [100, '1 - 100']], max, (v) => { max = v; Store.set('orderMax', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const start = rand(max - 3) + 1;
    const missing = rand(3) + 1; // posisi yang kosong (1..3)
    const seq = [start, start + 1, start + 2, start + 3];
    const ans = seq[missing];
    body.innerHTML = '';
    const boxes = h('div', { class: 'row', style: { gap: '8px', flexWrap: 'nowrap' } });
    const cells = seq.map((v, i) => {
      const c = h('div', { class: 'choice small', style: { background: i === missing ? '#FFF1C9' : '#fff' } }, i === missing ? '?' : v);
      boxes.append(c);
      return c;
    });
    body.append(
      h('div', { class: 'prompt' }, 'Angka berapa yang hilang?'),
      boxes,
      numberChoices(makeChoices(ans, 1, max, 3), ans, async () => {
        cells[missing].textContent = ans;
        await celebrate();
        if (!alive(tok)) return;
        for (let i = 0; i < seq.length; i++) {
          cells[i].classList.add('right');
          await Promise.all([speak(numWord(seq[i])), sleep(step(700))]);
          if (!alive(tok)) return;
        }
        await sleep(step(600), tok) && round();
      }, async (v) => {
        tryAgain('Coba lagi. Sesudah ' + numWord(seq[missing - 1]) + ' adalah?');
      })
    );
    speak('Angka berapa yang hilang? ' + seq.map((v, i) => (i === missing ? 'hmm' : numWord(v))).join(', '));
  }
  round();
};
