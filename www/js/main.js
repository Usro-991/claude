/* Belajar bersama Zayn — layar sambutan, beranda, menu orang tua, dan start aplikasi */
'use strict';

const APP_NAME = 'Belajar bersama Zayn';
const APP_AUTHOR = 'Rizky Muhammad';
const APP_VERSION = '1.1';

function waktu() {
  const jam = new Date().getHours();
  if (jam >= 4 && jam < 11) return 'pagi';
  if (jam >= 11 && jam < 15) return 'siang';
  if (jam >= 15 && jam < 18) return 'sore';
  return 'malam';
}

/* ---------- Layar sambutan (juga membuka izin suara di browser) ---------- */
Screens['welcome'] = (root) => {
  root.classList.add('welcome-bg');
  const start = async () => {
    Sfx.good();
    ctx();
    go('home', { greet: true }, { replace: true });
  };
  root.append(h('div', { class: 'welcome' },
    h('div', { class: 'blob b1' }), h('div', { class: 'blob b2' }), h('div', { class: 'blob b3' }),
    zayn(190, 'hero-zayn'),
    h('h1', { class: 'brand' }, h('span', { class: 'brand-top' }, 'Belajar bersama'), h('span', { class: 'brand-name' }, 'Zayn')),
    h('p', { class: 'tagline' }, 'Teman belajar si kecil, usia 1–7 tahun'),
    h('button', { class: 'btn xl', onclick: start }, 'Ayo mulai', icon('next', 26)),
    h('p', { class: 'credit' }, 'Dikembangkan oleh ', h('b', null, APP_AUTHOR))
  ));
  return () => root.classList.remove('welcome-bg');
};

const HOME_FEATURED = [
  ['count-menu', {}, 'count', 'Berhitung', 'Mengenal angka, pelan-pelan dan satu per satu', '#FFE9D6'],
  ['hijaiyah-menu', {}, 'hijaiyah', 'Huruf Hijaiyah', 'Alif sampai Ya, lengkap dengan suara dan harakat', '#E0F7F2'],
];
const HOME_TILES = [
  ['draw', {}, 'draw', 'Menggambar', 'Bebas berkreasi', '#FFE4EF'],
  ['trace-pick', { set: 'angka' }, 'write', 'Menulis', 'Angka & huruf', '#EFEAFF'],
  ['learn', { kind: 'abc' }, 'abc', 'Huruf ABC', 'A sampai Z', '#DCEBFF'],
  ['learn', { kind: 'animals' }, 'animals', 'Hewan', 'Nama & suaranya', '#FFF1D6'],
  ['learn', { kind: 'colors' }, 'colors', 'Warna', 'Merah, kuning, biru', '#FFE3E1'],
  ['learn', { kind: 'shapes' }, 'shapes', 'Bentuk', 'Bulat, kotak, segitiga', '#E3F8EF'],
  ['memory', {}, 'memory', 'Cocokkan Kartu', 'Latih ingatan', '#E6F0FF'],
  ['balloon', {}, 'balloon', 'Pecah Balon', 'Untuk si kecil', '#FFEFD9'],
];

Screens['home'] = (root, { greet = false } = {}, tok) => {
  const n = nama();
  const hello = 'Selamat ' + waktu() + (n ? ', ' + n : '') + '!';
  const bubble = h('div', { class: 'coach-text' }, 'Hari ini mau belajar apa?');
  root.append(
    h('div', { class: 'home-head' },
      zayn(84, 'home-zayn'),
      h('div', { class: 'home-hello' },
        h('div', { class: 'hello' }, hello),
        h('div', { class: 'bubble home-bubble' }, bubble)),
      h('div', { class: 'home-actions' },
        starPill(),
        h('button', { class: 'icon-btn small', 'aria-label': 'Menu orang tua', onclick: () => go('parent-gate') }, icon('gear', 24))))
  );

  const featured = h('div', { class: 'featured' });
  HOME_FEATURED.forEach(([screen, params, artName, title, sub, tint], k) => {
    featured.append(h('button', {
      class: 'feature-card', style: { '--tint': tint, animationDelay: k * 60 + 'ms' },
      onclick: () => { Sfx.tap(); go(screen, params); },
    },
    h('div', { class: 'feature-art' }, art(artName, 76)),
    h('div', { class: 'feature-text' }, h('div', { class: 'feature-title' }, title), h('div', { class: 'feature-sub' }, sub)),
    h('div', { class: 'feature-go' }, icon('next', 24))));
  });

  root.append(
    featured,
    h('h2', { class: 'section' }, 'Main sambil belajar'),
    menuGrid(HOME_TILES),
    h('footer', { class: 'credit-foot' },
      h('div', null, APP_NAME + ' · versi ' + APP_VERSION),
      h('div', null, 'Dikembangkan oleh ', h('b', null, APP_AUTHOR)))
  );

  const lines = [
    'Hari ini mau belajar apa?',
    'Mau main angka atau huruf dulu?',
    'Pilih yang kamu suka, ya.',
    'Aku sudah siap. Kamu siap belajar?',
  ];
  const text = greet
    ? 'Assalamualaikum! ' + hello.replace('!', '.') + ' Aku Zayn. Yuk, belajar bareng aku. Mau mulai dari mana?'
    : line('home', lines);
  bubble.textContent = greet ? 'Assalamualaikum! Aku Zayn. Yuk, belajar bareng aku!' : text;
  if (greet || Math.random() < 0.5) speak(text, 'id-ID', 1, { show: bubble.textContent });
};

/* ---------- Gerbang orang tua: soal hitungan sederhana agar anak tidak mengubah pengaturan ---------- */
Screens['parent-gate'] = (root) => {
  const a = rand(5) + 4;
  const b = rand(5) + 3;
  root.append(topbar('Untuk Orang Tua'));
  const opts = shuffle([a * b, a * b + a, a * b - b, a * b + 2]);
  const row = h('div', { class: 'choices' });
  opts.forEach((v) => row.append(h('button', {
    class: 'choice', style: { fontSize: '30px' },
    onclick: () => (v === a * b ? go('parent', {}, { replace: true }) : home()),
  }, v)));
  root.append(h('div', { class: 'stage' },
    h('p', { class: 'hint' }, 'Bagian ini khusus untuk ayah dan bunda. Jawab dulu soal berikut:'),
    h('div', { class: 'prompt' }, `${a} × ${b} = ?`), row));
};

Screens['parent'] = (root) => {
  root.append(topbar('Pengaturan'));
  const status = h('p', { class: 'muted' }, '');
  const range = (label, key, min, max, stepV, fmt) => {
    const out = h('b', null, fmt(Settings[key]));
    const input = h('input', { type: 'range', min, max, step: stepV, value: Settings[key], 'aria-label': label });
    input.addEventListener('input', () => { Settings[key] = +input.value; out.textContent = fmt(Settings[key]); saveSettings(); });
    return h('div', { class: 'field' }, h('div', { class: 'field-label' }, label, out), input);
  };
  const check = (label, key) => {
    const input = h('input', { type: 'checkbox', class: 'switch' });
    input.checked = !!Settings[key];
    input.addEventListener('change', () => { Settings[key] = input.checked; saveSettings(); });
    return h('label', { class: 'field row-field' }, h('span', null, label), input);
  };
  const nameInput = h('input', { type: 'text', class: 'text-input', maxlength: '20', placeholder: 'Contoh: Aisyah', value: Settings.childName || '' });
  nameInput.addEventListener('input', () => { Settings.childName = nameInput.value.trim(); saveSettings(); });

  root.append(h('div', { class: 'panel' },
    h('div', { class: 'field' },
      h('label', { class: 'field-label', for: 'child-name' }, 'Nama panggilan anak'),
      Object.assign(nameInput, { id: 'child-name' }),
      h('p', { class: 'muted' }, 'Zayn akan sesekali memanggil anak dengan nama ini, misalnya "Pintar sekali, Aisyah!"')),
    check('Suara Zayn', 'voice'),
    check('Efek suara', 'sound'),
    range('Kecepatan bicara', 'rate', 0.6, 1.2, 0.05, (v) => Math.round(v * 100) + '%'),
    range('Jeda saat berhitung (makin besar makin pelan)', 'slow', 0.7, 2, 0.1, (v) => v.toFixed(1) + '×'),
    h('div', { class: 'row' },
      h('button', { class: 'btn ghost', onclick: () => speak(sapa('Halo! Aku Zayn. Satu, dua, tiga. Ayo belajar!', 1)) }, icon('sound', 22), 'Tes suara'),
      h('button', { class: 'btn ghost', onclick: () => sayArab('أَلِف، بَاء، تَاء', 'Alif, Ba, Ta') }, icon('sound', 22), 'Tes suara Arab')),
    status,
    h('p', { class: 'muted' }, 'Kalau huruf hijaiyah tidak bersuara: buka Pengaturan HP → Sistem → Bahasa & input → Output text-to-speech → Google → Instal data suara → pilih Arab.'),
    h('div', { class: 'field row-field' }, h('span', null, 'Bintang terkumpul'), h('b', null, stars)),
    h('button', { class: 'btn warm', onclick: () => { stars = 0; Store.set('stars', 0); go('parent', {}, { replace: true }); } }, 'Atur ulang bintang'),
    h('div', { class: 'about' },
      zayn(56),
      h('div', null,
        h('div', { class: 'about-title' }, APP_NAME),
        h('div', { class: 'muted' }, 'Versi ' + APP_VERSION + ' · tanpa iklan · bisa dipakai tanpa internet'),
        h('div', null, 'Dikembangkan oleh ', h('b', null, APP_AUTHOR))))
  ));

  // Cek dukungan bahasa di HP (hanya di aplikasi Android)
  if (TTS && isNative && TTS.isLanguageSupported) {
    Promise.all([
      TTS.isLanguageSupported({ lang: 'id-ID' }).catch(() => ({ supported: false })),
      TTS.isLanguageSupported({ lang: 'ar-SA' }).catch(() => ({ supported: false })),
    ]).then(([id, ar]) => {
      status.textContent = `Suara Indonesia: ${id.supported ? 'tersedia' : 'belum terpasang'} · Suara Arab: ${ar.supported ? 'tersedia' : 'belum terpasang'}`;
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

go('welcome');
