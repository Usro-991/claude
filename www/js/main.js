/* Dunia Ceria — beranda, menu orang tua, dan start aplikasi */
'use strict';

const HOME_TILES = [
  ['count-menu', {}, '🔢', 'Berhitung', 'var(--orange)', '1-7 th'],
  ['hijaiyah-menu', {}, 'ب', 'Huruf Hijaiyah', 'var(--teal)', '2-7 th'],
  ['draw', {}, '🎨', 'Menggambar', 'var(--pink)', '1-7 th'],
  ['trace-pick', { set: 'angka' }, '✏️', 'Menulis', 'var(--purple)', '4-7 th'],
  ['learn', { kind: 'abc' }, '🔤', 'Huruf ABC', 'var(--blue)', '3-7 th'],
  ['learn', { kind: 'animals' }, '🦁', 'Hewan', 'var(--green)', '1-5 th'],
  ['learn', { kind: 'colors' }, '🌈', 'Warna', 'var(--red)', '1-5 th'],
  ['learn', { kind: 'shapes' }, '🔺', 'Bentuk', 'var(--yellow)', '2-6 th'],
  ['memory', {}, '🃏', 'Cocokkan Kartu', 'var(--teal)', '3-7 th'],
  ['balloon', {}, '🎈', 'Pecah Balon', 'var(--orange)', '1-4 th'],
];

Screens['home'] = (root) => {
  root.append(
    h('div', { class: 'topbar' },
      h('div', { style: { width: '58px' } }),
      h('div', { style: { flex: 1 } }),
      h('div', { class: 'stars' }, '⭐', h('b', null, stars))),
    h('div', { class: 'hero' },
      h('div', { class: 'logo' }, 'Dunia Ceria'),
      h('div', { class: 'sub' }, 'Belajar sambil bermain 🌟'))
  );
  const grid = h('div', { class: 'grid' });
  HOME_TILES.forEach(([screen, params, ico, name, color, age]) => {
    grid.append(h('button', {
      class: 'tile', style: { background: color },
      onclick: () => { Sfx.tap(); go(screen, params); },
    },
    h('div', { class: 'ico' + (/[؀-ۿ]/.test(ico) ? ' arab' : '') }, ico),
    h('div', { class: 'name' }, name),
    h('div', { class: 'age' }, age)));
  });
  root.append(grid, h('button', { class: 'parent-link', onclick: () => go('parent-gate') }, '👨‍👩‍👧 Untuk Orang Tua'));
};

/* ---------- Gerbang orang tua: soal hitungan sederhana agar anak tidak mengubah pengaturan ---------- */
Screens['parent-gate'] = (root) => {
  const a = rand(5) + 4;
  const b = rand(5) + 3;
  root.append(topbar('Untuk Orang Tua', { sayTitle: false }));
  const opts = shuffle([a * b, a * b + a, a * b - b, a * b + 2]);
  const row = h('div', { class: 'choices' });
  opts.forEach((v) => row.append(h('button', {
    class: 'choice', style: { fontSize: '32px' },
    onclick: () => (v === a * b ? go('parent', {}, { replace: true }) : home()),
  }, v)));
  root.append(h('div', { class: 'center' }, h('div', { class: 'prompt' }, `${a} × ${b} = ?`), row));
};

Screens['parent'] = (root) => {
  root.append(topbar('Pengaturan', { sayTitle: false }));
  const status = h('p', null, '');
  const range = (label, key, min, max, stepV, fmt) => {
    const out = h('b', null, fmt(Settings[key]));
    const input = h('input', { type: 'range', min, max, step: stepV, value: Settings[key] });
    input.addEventListener('input', () => { Settings[key] = +input.value; out.textContent = fmt(Settings[key]); saveSettings(); });
    return h('label', null, h('span', null, label, ' ', out), input);
  };
  const check = (label, key) => {
    const input = h('input', { type: 'checkbox' });
    input.checked = !!Settings[key];
    input.addEventListener('change', () => { Settings[key] = input.checked; saveSettings(); });
    return h('label', null, label, input);
  };
  root.append(h('div', { class: 'panel' },
    check('🔊 Suara pembaca (TTS)', 'voice'),
    check('🎵 Efek suara', 'sound'),
    range('Kecepatan bicara', 'rate', 0.5, 1.2, 0.05, (v) => Math.round(v * 100) + '%'),
    range('Jeda berhitung (makin besar makin pelan)', 'slow', 0.7, 2, 0.1, (v) => v.toFixed(1) + '×'),
    h('div', { class: 'row' },
      h('button', { class: 'big-btn alt', onclick: () => speak('Satu, dua, tiga. Ayo belajar!') }, 'Tes suara Indonesia'),
      h('button', { class: 'big-btn', onclick: () => sayArab('أَلِف، بَاء، تَاء') }, 'Tes suara Arab')),
    status,
    h('p', null, 'Bila huruf hijaiyah tidak bersuara: buka Pengaturan HP → Sistem → Bahasa & input → Output text-to-speech → Google → Instal data suara → pilih "Arab" / "العربية".'),
    h('p', null, `Bintang terkumpul: ${stars} ⭐`),
    h('button', { class: 'big-btn warn', onclick: () => { stars = 0; Store.set('stars', 0); go('parent', {}, { replace: true }); } }, 'Reset bintang'),
    h('p', null, 'Dunia Ceria — aplikasi belajar anak usia 1–7 tahun. Tanpa iklan, tanpa internet.')
  ));

  // Cek dukungan bahasa di HP (hanya di aplikasi Android)
  if (TTS && isNative && TTS.isLanguageSupported) {
    Promise.all([
      TTS.isLanguageSupported({ lang: 'id-ID' }).catch(() => ({ supported: false })),
      TTS.isLanguageSupported({ lang: 'ar-SA' }).catch(() => ({ supported: false })),
    ]).then(([id, ar]) => {
      status.textContent = `Suara Indonesia: ${id.supported ? '✅ tersedia' : '❌ belum terpasang'} · Suara Arab: ${ar.supported ? '✅ tersedia' : '❌ belum terpasang'}`;
    });
  }
};

/* ---------- Mulai ---------- */
document.addEventListener('pointerdown', () => ctx(), { once: true });
document.addEventListener('contextmenu', (e) => e.preventDefault());

const CapApp = window.capacitorApp && window.capacitorApp.App;
if (CapApp && isNative) {
  CapApp.addListener('backButton', () => {
    if (!back()) CapApp.exitApp();
  });
  CapApp.addListener('pause', () => stopSpeak());
}

go('home');
