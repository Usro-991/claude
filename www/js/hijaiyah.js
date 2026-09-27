/* Belajar bersama Zayn — Belajar huruf hijaiyah */
'use strict';

/** Ucapkan teks Arab; gelembung menampilkan nama latin bila diberikan. */
const sayArab = (text, show) => speak(text, 'ar-SA', 0.9, { show: show === undefined ? text : show });

Screens['hijaiyah-menu'] = (root) => {
  root.append(topbar('Huruf Hijaiyah'), coach(''), menuGrid([
    ['hijaiyah-grid', {}, 'hijaiyah', 'Kenal Huruf', '30 huruf', '#E0F7F2'],
    ['hijaiyah-detail', { i: 0, auto: true }, 'play', 'Putar Pelan-pelan', 'Seperti Iqro', '#FFE9D6'],
    ['hijaiyah-harakat', {}, 'harakat', 'Harakat a-i-u', 'Fathah, kasrah, dhammah', '#EFEAFF'],
    ['hijaiyah-quiz', {}, 'ear', 'Tebak Huruf', 'Dengar lalu pilih', '#DCEBFF'],
    ['trace-pick', { set: 'hijaiyah' }, 'write', 'Menulis Huruf', 'Tebalkan garisnya', '#FFE4EF'],
  ]));
  speak(sapa(line('hij-menu', [
    'Bismillah. Ayo kita belajar huruf hijaiyah.',
    'Assalamualaikum! Hari ini kita belajar huruf Al-Quran, yuk.',
    'Yuk, kita kenalan dengan huruf hijaiyah. Mau mulai dari mana?',
  ])));
};

/* ---------- Semua huruf dalam satu layar ---------- */
Screens['hijaiyah-grid'] = (root) => {
  root.append(topbar('Kenal Huruf'), coach(''));
  const grid = h('div', { class: 'letter-grid' });
  HIJAIYAH.forEach((L, i) => {
    grid.append(h('button', {
      class: 'letter-card',
      style: { animationDelay: i * 15 + 'ms' },
      onclick: () => { Sfx.tap(); go('hijaiyah-detail', { i }); },
    }, h('span', { class: 'ch arab' }, L.ch), h('span', { class: 'lat' }, L.name)));
  });
  root.append(grid);
  speak('Ini semua huruf hijaiyah. Sentuh salah satu, nanti kita pelajari bareng.');
};

/* ---------- Detail satu huruf (bisa diputar otomatis & pelan) ---------- */
Screens['hijaiyah-detail'] = (root, { i = 0, auto = false }, tok) => {
  const L = HIJAIYAH[i];
  root.append(topbar(auto ? 'Putar Pelan-pelan' : 'Huruf ' + L.name), coach(''));

  const hero = h('button', { class: 'letter-hero arab', 'aria-label': 'Dengarkan huruf ' + L.name, onclick: () => { Sfx.tap(); intro(false); } }, L.ch);
  const name = h('div', { class: 'letter-name' }, L.name);
  const forms = h('div', { class: 'forms' });
  letterForms(L.ch).forEach(([label, ch]) => {
    forms.append(h('button', { class: 'f', onclick: () => sayArab(L.say, L.name + ' di ' + label.toLowerCase()) },
      h('div', { class: 'ch arab' }, ch), h('div', { class: 'lat' }, label)));
  });
  const har = h('div', { class: 'harakat-row' });
  if (!L.noHarakat) {
    const lat = harakatLatin(L);
    harakatOf(L).forEach((ch, k) => {
      har.append(h('button', { class: 'choice har', onclick: () => { Sfx.tap(); sayArab(ch, lat[k]); } },
        h('div', { class: 'ch arab' }, ch), h('div', { class: 'lat' }, lat[k])));
    });
  }

  const nav = (d) => {
    const j = (i + d + HIJAIYAH.length) % HIJAIYAH.length;
    go('hijaiyah-detail', { i: j, auto }, { replace: true });
  };
  const pager = h('div', { class: 'pager' },
    h('button', { class: 'icon-btn', 'aria-label': 'Sebelumnya', onclick: () => nav(-1) }, icon('back', 28)),
    h('div', { class: 'count' }, (i + 1) + ' / ' + HIJAIYAH.length),
    h('button', { class: 'icon-btn', 'aria-label': 'Berikutnya', onclick: () => nav(1) }, icon('next', 28)),
    h('button', {
      class: 'icon-btn accent', 'aria-label': auto ? 'Jeda' : 'Putar otomatis',
      onclick: () => go('hijaiyah-detail', { i, auto: !auto }, { replace: true }),
    }, icon(auto ? 'pause' : 'play', 26)),
    h('button', { class: 'icon-btn', 'aria-label': 'Tulis huruf ini', onclick: () => go('trace', { set: 'hijaiyah', i }) }, icon('pencil', 26))
  );

  root.append(h('div', { class: 'stage' }, hero, name, forms, har, pager));

  async function intro(first) {
    const opener = first && i === 0
      ? 'Kita mulai dari huruf pertama, ya. Dengarkan baik-baik.'
      : line('hij-open', ['Ini huruf', 'Nah, ini huruf', 'Yang ini namanya', 'Sekarang huruf']);
    await Promise.all([speak(opener), sleep(600)]);
    if (!alive(tok)) return false;
    hero.classList.remove('pulse'); void hero.offsetWidth; hero.classList.add('pulse');
    await Promise.all([sayArab(L.say, L.name), sleep(step(1300))]);
    if (!alive(tok)) return false;
    if (!auto) {
      await Promise.all([speak(line('hij-repeat', ['Ayo tirukan. ' + L.name + '.', 'Coba ucapkan, ' + L.name + '.', 'Ikuti, ya. ' + L.name + '.'])), sleep(step(1600))]);
      if (!alive(tok)) return false;
    }
    if (!L.noHarakat) {
      await sleep(step(400));
      if (!auto) await speak('Kalau diberi harakat, bacanya begini.');
      const btns = har.querySelectorAll('.choice');
      const chs = harakatOf(L);
      const lat = harakatLatin(L);
      for (let k = 0; k < chs.length; k++) {
        if (!alive(tok)) return false;
        btns[k].classList.add('lit');
        await Promise.all([sayArab(chs[k], lat[k]), sleep(step(1100))]);
        btns[k].classList.remove('lit');
      }
    }
    return alive(tok);
  }

  (async () => {
    const ok = await intro(true);
    if (ok && auto) {
      await sleep(step(1200));
      if (alive(tok)) nav(1);
    }
  })();
};

/* ---------- Harakat: fathah, kasrah, dhammah ---------- */
Screens['hijaiyah-harakat'] = (root, params, tok) => {
  let mode = 0; // 0 = fathah (a), 1 = kasrah (i), 2 = dhammah (u)
  const EXPLAIN = [
    'Fathah itu garis kecil di atas huruf. Dibaca a. Contohnya, ba.',
    'Kasrah itu garis kecil di bawah huruf. Dibaca i. Contohnya, bi.',
    'Dhammah bentuknya seperti koma kecil di atas huruf. Dibaca u. Contohnya, bu.',
  ];
  root.append(topbar('Harakat a - i - u'), coach(''));
  const labels = [[0, 'Fathah'], [1, 'Kasrah'], [2, 'Dhammah']];
  const grid = h('div', { class: 'letter-grid' });
  const playLabel = h('span', null, 'Baca berurutan');
  const playIc = h('span');
  const playBtn = h('button', { class: 'btn', onclick: () => playAll() }, playIc, playLabel);
  const setPlayUi = (on) => {
    playIc.replaceChildren(icon(on ? 'stop' : 'play', 22));
    playLabel.textContent = on ? 'Berhenti' : 'Baca berurutan';
  };
  setPlayUi(false);
  const letters = HIJAIYAH.filter((L) => !L.noHarakat);
  const render = () => {
    grid.innerHTML = '';
    letters.forEach((L) => {
      const ch = harakatOf(L)[mode];
      const lat = harakatLatin(L)[mode];
      grid.append(h('button', { class: 'letter-card', onclick: () => { Sfx.tap(); sayArab(ch, lat); } },
        h('span', { class: 'ch arab' }, ch), h('span', { class: 'lat' }, lat)));
    });
  };
  let playing = false;
  async function playAll() {
    if (playing) { playing = false; setPlayUi(false); return; }
    playing = true;
    setPlayUi(true);
    const cards = [...grid.children];
    await speak('Ikuti bacaannya, ya. Pelan-pelan saja.');
    for (let k = 0; k < cards.length && playing && alive(tok); k++) {
      cards[k].scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      cards[k].classList.add('lit');
      await Promise.all([sayArab(harakatOf(letters[k])[mode], harakatLatin(letters[k])[mode]), sleep(step(1300))]);
      cards[k].classList.remove('lit');
    }
    playing = false;
    setPlayUi(false);
  }
  root.append(
    segmented(labels, mode, (v) => { mode = v; playing = false; setPlayUi(false); render(); speak(EXPLAIN[v]); }),
    h('div', { class: 'row', style: { marginBottom: '14px' } }, playBtn),
    grid
  );
  render();
  speak(EXPLAIN[0]);
  return () => { playing = false; };
};

/* ---------- Tebak huruf: dengar lalu pilih ---------- */
Screens['hijaiyah-quiz'] = (root, params, tok) => {
  let n = Store.get('hijQuizN', 3);
  let range = Store.get('hijQuizRange', 10);
  const body = h('div', { class: 'stage' });
  root.append(topbar('Tebak Huruf'), coach(''),
    segmented([[10, 'Alif – Dzal'], [20, 'Alif – Fa'], [30, 'Semua']], range, (v) => { range = v; Store.set('hijQuizRange', v); round(); }),
    segmented([[3, '3'], [4, '4'], [6, '6']], n, (v) => { n = v; Store.set('hijQuizN', v); round(); }, 'Pilihan'),
    body);

  function round() {
    if (!alive(tok)) return;
    const pool = HIJAIYAH.slice(0, range);
    const target = pick(pool);
    const opts = shuffle([target, ...shuffle(pool.filter((x) => x !== target)).slice(0, n - 1)]);
    body.innerHTML = '';
    const ask = async () => {
      await speak(line('hij-ask', ['Coba cari huruf', 'Mana huruf', 'Yang mana huruf']), 'id-ID', 1, { show: 'Mana huruf ' + target.name + '?' });
      if (alive(tok)) await sayArab(target.say, 'Mana huruf ' + target.name + '?');
    };
    const row = h('div', { class: 'choices', style: { direction: 'rtl' } });
    let busy = false;
    opts.forEach((L) => {
      const b = h('button', { class: 'choice arab' }, L.ch);
      b.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        if (L === target) {
          b.classList.add('right');
          await sayArab(L.say, L.name);
          await celebrate();
          await sleep(step(600), tok) && round();
        } else {
          b.classList.add('wrong');
          setTimeout(() => b.classList.remove('wrong'), 500);
          Sfx.soft();
          await speak('Hmm, yang itu huruf', 'id-ID', 1, { show: 'Itu huruf ' + L.name });
          await sayArab(L.say, 'Itu huruf ' + L.name);
          await sleep(300);
          if (alive(tok)) await speak('Coba dengarkan lagi, ya.');
          if (alive(tok)) await ask();
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
