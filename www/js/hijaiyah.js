/* Dunia Ceria — Belajar huruf hijaiyah */
'use strict';

const sayArab = (text) => speak(text, 'ar-SA', 0.9);

Screens['hijaiyah-menu'] = (root) => {
  root.append(topbar('Huruf Hijaiyah'));
  const items = [
    ['hijaiyah-grid', 'ب', 'Kenal Huruf', 'var(--teal)', '2-7 th', {}],
    ['hijaiyah-detail', '▶️', 'Putar Pelan-pelan', 'var(--orange)', '1-7 th', { i: 0, auto: true }],
    ['hijaiyah-harakat', 'بَ', 'Harakat a-i-u', 'var(--purple)', '4-7 th', {}],
    ['hijaiyah-quiz', '🎧', 'Tebak Huruf', 'var(--blue)', '3-7 th', {}],
    ['trace-pick', '✏️', 'Menulis Huruf', 'var(--pink)', '4-7 th', { set: 'hijaiyah' }],
  ];
  const grid = h('div', { class: 'grid' });
  items.forEach(([screen, ico, name, color, age, params]) => {
    grid.append(h('button', {
      class: 'tile', style: { background: color },
      onclick: () => { Sfx.tap(); go(screen, params); },
    }, h('div', { class: 'ico' + (/[؀-ۿ]/.test(ico) ? ' arab' : '') }, ico), h('div', { class: 'name' }, name), h('div', { class: 'age' }, age)));
  });
  root.append(grid);
};

/* ---------- Semua huruf dalam satu layar ---------- */
Screens['hijaiyah-grid'] = (root) => {
  root.append(topbar('Kenal Huruf'), h('p', { class: 'hint' }, 'Sentuh huruf untuk mendengar & belajar'));
  const grid = h('div', { class: 'letter-grid' });
  HIJAIYAH.forEach((L, i) => {
    grid.append(h('button', {
      class: 'letter-card',
      onclick: () => { Sfx.tap(); sayArab(L.say); go('hijaiyah-detail', { i }); },
    }, h('span', { class: 'ch arab' }, L.ch), h('span', { class: 'lat' }, L.name)));
  });
  root.append(grid);
};

/* ---------- Detail satu huruf (bisa diputar otomatis & pelan) ---------- */
Screens['hijaiyah-detail'] = (root, { i = 0, auto = false }, tok) => {
  const L = HIJAIYAH[i];
  root.append(topbar(auto ? 'Putar Pelan-pelan' : 'Huruf ' + L.name, { sayTitle: false }));

  const hero = h('button', { class: 'letter-hero arab anim', onclick: () => { Sfx.tap(); intro(); } }, L.ch);
  const name = h('div', { class: 'letter-name' }, L.name);
  const forms = h('div', { class: 'forms' });
  letterForms(L.ch).forEach(([label, ch]) => {
    forms.append(h('button', { class: 'f', onclick: () => sayArab(L.say) },
      h('div', { class: 'ch arab' }, ch), h('div', { class: 'lat' }, label)));
  });
  const har = h('div', { class: 'harakat-row' });
  if (!L.noHarakat) {
    const lat = harakatLatin(L);
    harakatOf(L).forEach((ch, k) => {
      har.append(h('button', { class: 'choice', onclick: () => { Sfx.tap(); sayArab(ch); } },
        h('div', { class: 'ch arab' }, ch), h('div', { class: 'lat' }, lat[k])));
    });
  }

  const nav = (d) => {
    const j = (i + d + HIJAIYAH.length) % HIJAIYAH.length;
    go('hijaiyah-detail', { i: j, auto }, { replace: true });
  };
  const pager = h('div', { class: 'pager' },
    h('button', { class: 'round-btn', onclick: () => nav(-1) }, '⬅'),
    h('div', { class: 'count' }, (i + 1) + ' / ' + HIJAIYAH.length),
    h('button', { class: 'round-btn', onclick: () => nav(1) }, '➡'),
    auto ? h('button', { class: 'round-btn', onclick: () => go('hijaiyah-detail', { i, auto: false }, { replace: true }) }, '⏸️')
      : h('button', { class: 'round-btn', onclick: () => go('hijaiyah-detail', { i, auto: true }, { replace: true }) }, '▶️'),
    h('button', { class: 'round-btn', onclick: () => go('trace', { set: 'hijaiyah', i }) }, '✏️')
  );

  root.append(h('div', { class: 'center' }, hero, name, forms, har, pager));

  async function intro() {
    await Promise.all([speak('Ini huruf'), sleep(700)]);
    if (!alive(tok)) return false;
    await Promise.all([sayArab(L.say), sleep(step(1300))]);
    if (!alive(tok)) return false;
    if (!L.noHarakat) {
      await sleep(step(500));
      const btns = har.querySelectorAll('.choice');
      const chs = harakatOf(L);
      for (let k = 0; k < chs.length; k++) {
        if (!alive(tok)) return false;
        btns[k].classList.add('right');
        await Promise.all([sayArab(chs[k]), sleep(step(1100))]);
        btns[k].classList.remove('right');
      }
    }
    return alive(tok);
  }

  (async () => {
    const ok = await intro();
    if (ok && auto) {
      await sleep(step(1200));
      if (alive(tok)) nav(1);
    }
  })();
};

/* ---------- Harakat: fathah, kasrah, dhammah ---------- */
Screens['hijaiyah-harakat'] = (root, params, tok) => {
  let mode = 0; // 0 = fathah (a), 1 = kasrah (i), 2 = dhammah (u)
  root.append(topbar('Harakat a - i - u'));
  const labels = [[0, 'Fathah ( a )'], [1, 'Kasrah ( i )'], [2, 'Dhammah ( u )']];
  const grid = h('div', { class: 'letter-grid' });
  const playBtn = h('button', { class: 'big-btn', onclick: () => playAll() }, '▶️ Baca berurutan pelan-pelan');
  const render = () => {
    grid.innerHTML = '';
    HIJAIYAH.filter((L) => !L.noHarakat).forEach((L) => {
      const ch = harakatOf(L)[mode];
      const lat = harakatLatin(L)[mode];
      grid.append(h('button', { class: 'letter-card', onclick: () => { Sfx.tap(); sayArab(ch); } },
        h('span', { class: 'ch arab' }, ch), h('span', { class: 'lat' }, lat)));
    });
  };
  let playing = false;
  async function playAll() {
    if (playing) { playing = false; playBtn.textContent = '▶️ Baca berurutan pelan-pelan'; return; }
    playing = true;
    playBtn.textContent = '⏹️ Berhenti';
    const cards = [...grid.children];
    const letters = HIJAIYAH.filter((L) => !L.noHarakat);
    for (let k = 0; k < cards.length && playing && alive(tok); k++) {
      cards[k].scrollIntoView({ block: 'center', behavior: 'smooth' });
      cards[k].style.background = '#FFF1C9';
      cards[k].style.transform = 'scale(1.12)';
      await Promise.all([sayArab(harakatOf(letters[k])[mode]), sleep(step(1300))]);
      cards[k].style.background = '';
      cards[k].style.transform = '';
    }
    playing = false;
    playBtn.textContent = '▶️ Baca berurutan pelan-pelan';
  }
  root.append(
    segmented(labels, mode, (v) => { mode = v; playing = false; playBtn.textContent = '▶️ Baca berurutan pelan-pelan'; render(); }),
    h('div', { class: 'row', style: { marginBottom: '12px' } }, playBtn),
    grid
  );
  render();
  return () => { playing = false; };
};

/* ---------- Tebak huruf: dengar lalu pilih ---------- */
Screens['hijaiyah-quiz'] = (root, params, tok) => {
  let n = Store.get('hijQuizN', 3);
  let range = Store.get('hijQuizRange', 10);
  const body = h('div', { class: 'center' });
  root.append(topbar('Tebak Huruf'),
    segmented([[10, 'Alif-Dzal'], [20, 'Alif-Fa'], [30, 'Semua']], range, (v) => { range = v; Store.set('hijQuizRange', v); round(); }),
    segmented([[3, '3 pilihan'], [4, '4 pilihan'], [6, '6 pilihan']], n, (v) => { n = v; Store.set('hijQuizN', v); round(); }),
    body);

  function round() {
    if (!alive(tok)) return;
    const pool = HIJAIYAH.slice(0, range);
    const target = pick(pool);
    const opts = shuffle([target, ...shuffle(pool.filter((x) => x !== target)).slice(0, n - 1)]);
    body.innerHTML = '';
    const ask = async () => {
      await speak('Mana huruf');
      if (alive(tok)) await sayArab(target.say);
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
          await sayArab(L.say);
          await celebrate();
          await sleep(step(700), tok) && round();
        } else {
          b.classList.add('wrong');
          setTimeout(() => b.classList.remove('wrong'), 500);
          Sfx.soft();
          await speak('Ini huruf');
          await sayArab(L.say);
          await sleep(300);
          if (alive(tok)) await ask();
          busy = false;
        }
      });
      row.append(b);
    });
    body.append(
      h('div', { class: 'prompt' }, 'Mana huruf ', h('span', { style: { color: 'var(--purple)' } }, target.name), '?'),
      h('button', { class: 'round-btn', style: { width: '84px', height: '84px', fontSize: '40px' }, onclick: ask }, '🔊'),
      row
    );
    ask();
  }
  round();
};
