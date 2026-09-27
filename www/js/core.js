/* Belajar bersama Zayn — inti aplikasi: elemen, suara, TTS, efek, navigasi */
'use strict';

const $app = document.getElementById('app');
const $fx = document.getElementById('fx');

/* ---------- Pembuat elemen kecil ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v)) {
          if (sk.startsWith('--')) el.style.setProperty(sk, sv);
          else el.style[sk] = sv;
        }
      }
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    }
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Penyimpanan ---------- */
const Store = {
  get(key, def) {
    try {
      const v = localStorage.getItem('dc_' + key);
      return v == null ? def : JSON.parse(v);
    } catch (e) { return def; }
  },
  set(key, val) {
    try { localStorage.setItem('dc_' + key, JSON.stringify(val)); } catch (e) { /* penuh / diblokir */ }
  },
};

const Settings = Object.assign(
  { rate: 0.9, pitch: 1, sound: true, voice: true, slow: 1, childName: '', voiceId: '', voiceAr: '', useRec: true },
  Store.get('settings', {})
);
function saveSettings() { Store.set('settings', Settings); }

/* ---------- Token sesi: membatalkan urutan animasi saat pindah layar ---------- */
let sessionToken = 0;
const alive = (tok) => tok === sessionToken;
function sleep(ms, tok) {
  return new Promise((res) => setTimeout(() => res(tok == null || alive(tok)), ms));
}

/* ---------- Rekaman suara sendiri (disimpan di IndexedDB) ----------
 * Kunci rekaman: 'num:3', 'hij:0', 'praise:2', 'gentle:1', dst.
 * Bila rekaman ada, rekaman itu yang diputar, menggantikan suara mesin.
 */
const Rec = (() => {
  const keys = new Set();
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((resolve) => {
      try {
        const req = indexedDB.open('zayn-voice', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('clips');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const d = await db();
    if (!d) return null;
    return new Promise((resolve) => {
      try {
        const t = d.transaction('clips', mode);
        const r = fn(t.objectStore('clips'));
        t.oncomplete = () => resolve(r && 'result' in r ? r.result : null);
        t.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }
  const ready = tx('readonly', (st) => st.getAllKeys()).then((all) => { (all || []).forEach((k) => keys.add(k)); });
  return {
    ready,
    has: (k) => keys.has(k),
    count: (prefix) => [...keys].filter((k) => k.startsWith(prefix)).length,
    list: (prefix) => [...keys].filter((k) => k.startsWith(prefix)),
    get: (k) => tx('readonly', (st) => st.get(k)),
    async set(k, blob) { await tx('readwrite', (st) => st.put(blob, k)); keys.add(k); },
    async del(k) { await tx('readwrite', (st) => st.delete(k)); keys.delete(k); },
  };
})();

let currentAudio = null;
/** Putar rekaman; resolve saat selesai (atau gagal). */
async function playClip(key) {
  const blob = await Rec.get(key);
  if (!blob) return false;
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const a = new Audio(url);
    currentAudio = a;
    const done = () => { URL.revokeObjectURL(url); if (currentAudio === a) currentAudio = null; resolve(true); };
    a.onended = done;
    a.onerror = done;
    a.onpause = done;
    a.play().catch(done);
  });
}

/* ---------- Text-to-speech ---------- */
const TTS = (window.capacitorTextToSpeech && window.capacitorTextToSpeech.TextToSpeech) || null;
const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

/** Daftar suara yang tersedia di HP/browser (dipakai untuk memilih suara yang paling enak didengar). */
let voiceList = [];
async function loadVoices() {
  try {
    if (TTS && isNative) voiceList = (await TTS.getSupportedVoices()).voices || [];
    else if ('speechSynthesis' in window) voiceList = speechSynthesis.getVoices();
  } catch (e) { voiceList = []; }
  return voiceList;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { if (!isNative) voiceList = speechSynthesis.getVoices(); };
loadVoices();

function voicesFor(lang) {
  const base = lang.slice(0, 2).toLowerCase();
  return voiceList
    .map((v, index) => ({ v, index }))
    .filter(({ v }) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(base));
}
/** Indeks suara pilihan orang tua untuk bahasa ini, atau -1 bila memakai bawaan HP. */
function chosenVoice(lang) {
  const uri = lang.startsWith('ar') ? Settings.voiceAr : Settings.voiceId;
  if (!uri) return -1;
  const hit = voicesFor(lang).find(({ v }) => v.voiceURI === uri || v.name === uri);
  return hit ? hit.index : -1;
}

function webSpeak(text, lang, rate) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = Settings.pitch;
    const idx = chosenVoice(lang);
    const v = idx >= 0 ? voiceList[idx] : (voicesFor(lang)[0] || {}).v;
    if (v) u.voice = v;
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    u.onend = finish;
    u.onerror = finish;
    // Pengaman bila onend tidak pernah terpanggil
    setTimeout(finish, 800 + text.length * 180 / rate);
    speechSynthesis.speak(u);
  });
}

/** Tampilkan teks di gelembung Zayn dan gerakkan mulutnya selama bicara. */
function caption(text, talking) {
  document.querySelectorAll('.coach-text').forEach((el) => {
    if (text != null) el.textContent = text;
  });
  document.querySelectorAll('.zayn').forEach((z) => z.classList.toggle('talking', !!talking));
}

/**
 * Ucapkan teks. lang: 'id-ID' (bawaan) atau 'ar-SA' untuk bahasa Arab.
 * Selalu resolve (tidak pernah gagal), sehingga urutan animasi tetap berjalan tanpa suara.
 * opts.show: teks untuk gelembung (bawaan: teks yang diucapkan), false = gelembung tidak diubah.
 * opts.key: kunci rekaman suara orang tua; bila ada, rekaman itu yang diputar.
 */
async function speak(text, lang = 'id-ID', rateMul = 1, opts = {}) {
  if (!text) return;
  const show = opts.show === undefined ? text : opts.show;
  if (show !== false) caption(show, Settings.voice);
  if (!Settings.voice) return;
  stopSpeak();
  try {
    if (opts.key && Settings.useRec && Rec.has(opts.key)) {
      await playClip(opts.key);
      return;
    }
    const rate = Math.max(0.3, Settings.rate * rateMul);
    if (TTS && isNative) {
      const voice = chosenVoice(lang);
      const o = { text, lang, rate, pitch: Settings.pitch, volume: 1, category: 'playback', queueStrategy: 0 };
      if (voice >= 0) o.voice = voice;
      await TTS.speak(o);
    } else {
      await webSpeak(text, lang, rate);
    }
  } catch (e) {
    /* suara bahasa ini mungkin belum terpasang di HP */
  } finally {
    caption(null, false);
  }
}
function stopSpeak() {
  try {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (TTS && isNative) TTS.stop().catch(() => {});
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  } catch (e) { /* abaikan */ }
}
/** Kunci rekaman untuk angka (hanya 1–20 yang bisa direkam). */
const numKey = (n) => (n >= 0 && n <= 20 ? 'num:' + n : undefined);

/* ---------- Efek suara (tanpa file, dibuat dengan WebAudio) ---------- */
let audioCtx = null;
function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, dur, type = 'sine', vol = 0.18, when = 0, slideTo) {
  if (!Settings.sound) return;
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime + when;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
const Sfx = {
  tap() { tone(660, 0.08, 'triangle', 0.12); },
  count(i = 0) { tone(440 * Math.pow(2, (i % 12) / 12), 0.18, 'triangle', 0.16); },
  pop() { tone(900, 0.12, 'square', 0.08, 0, 200); },
  good() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.09)); },
  soft() { tone(330, 0.18, 'sine', 0.12); tone(294, 0.25, 'sine', 0.12, 0.15); },
  flip() { tone(500, 0.06, 'triangle', 0.08, 0, 700); },
};

/* ---------- Bintang (hadiah) ---------- */
let stars = Store.get('stars', 0);
function addStar(n = 1) {
  stars += n;
  Store.set('stars', stars);
  document.querySelectorAll('.stars b').forEach((b) => { b.textContent = stars; });
}

/* ---------- Kalimat guru: dibuat bervariasi supaya tidak terdengar seperti mesin ---------- */
const nama = () => (Settings.childName || '').trim();
/** Sisipkan nama anak sesekali, seperti guru memanggil muridnya. */
function sapa(text, chance = 0.5) {
  const n = nama();
  if (!n || Math.random() > chance) return text;
  return text.replace(/([.!?])?$/, (m) => ', ' + n + (m || '!'));
}
const recent = {};
/** Ambil kalimat acak dari daftar, tapi jangan sama dengan yang terakhir dipakai. */
function line(key, list) {
  let pickd;
  let guard = 0;
  do { pickd = pick(list); } while (list.length > 1 && pickd === recent[key] && guard++ < 10);
  recent[key] = pickd;
  return pickd;
}

const PRAISE = [
  'Wah, pintar sekali!', 'Betul! Hebat kamu.', 'Nah, itu dia!', 'Iya, benar! Tos dulu, dong!',
  'Masya Allah, pintar!', 'Keren! Kamu teliti sekali.', 'Seratus buat kamu!', 'Tepat sekali!',
  'Yes, betul!', 'Wah, kamu cepat belajar, ya.', 'Pinter! Aku bangga sama kamu.', 'Hore, benar!',
];
const SHORT_PRAISE = ['Hebat!', 'Pintar!', 'Betul!', 'Keren!', 'Mantap!', 'Hore!', 'Yes!'];
const GENTLE = [
  'Hmm, belum pas. Yuk, coba lagi.', 'Hampir! Coba lihat sekali lagi, ya.',
  'Tidak apa-apa, salah itu biasa. Ayo coba lagi.', 'Eits, bukan yang itu. Pelan-pelan saja.',
  'Coba perhatikan baik-baik, ya.', 'Belum tepat, tapi kamu sudah berani mencoba. Ayo sekali lagi!',
];
/**
 * Pilih kalimat dari daftar. Kalau orang tua sudah merekam beberapa kalimat,
 * yang terekam diutamakan supaya anak lebih sering mendengar suara asli.
 * Mengembalikan [teks, kunciRekaman].
 */
function pickLine(group, list) {
  const recorded = Settings.useRec ? list.map((t, i) => i).filter((i) => Rec.has(group + ':' + i)) : [];
  if (recorded.length) {
    const i = recorded.length > 1 ? recorded.filter((k) => k !== recent[group])[rand(recorded.length - 1)] : recorded[0];
    recent[group] = i;
    return [list[i], group + ':' + i];
  }
  return [line(group, list), undefined];
}
const praise = () => { const [t, key] = pickLine('praise', PRAISE); return key ? [t, key] : [sapa(t), undefined]; };
const gentle = () => pickLine('gentle', GENTLE);

/* ---------- Efek perayaan ---------- */
const COLORS = ['#FF7A59', '#FFC53D', '#34C3A0', '#4DA3FF', '#8C7CFF', '#FF7EB6'];
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function confetti(n = 36) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    const c = h('div', {
      class: 'confetti',
      style: {
        left: Math.random() * 100 + 'vw',
        background: pick(COLORS),
        borderRadius: Math.random() > 0.5 ? '50%' : '3px',
        animationDuration: 1.6 + Math.random() * 1.6 + 's',
        animationDelay: Math.random() * 0.3 + 's',
      },
    });
    $fx.append(c);
    setTimeout(() => c.remove(), 3800);
  }
}
async function celebrate(text, { star = true, say = true } = {}) {
  const [spoken, key] = text ? [text, undefined] : praise();
  Sfx.good();
  confetti();
  const badge = h('div', { class: 'cheer' },
    star ? h('span', { class: 'cheer-star' }, icon('star', 40)) : null,
    h('span', null, text || line('short', SHORT_PRAISE)));
  $fx.append(badge);
  setTimeout(() => badge.remove(), 1500);
  if (star) addStar();
  if (say) await speak(spoken, 'id-ID', 1, { key });
}
async function tryAgain(say) {
  Sfx.soft();
  if (say) return speak(say);
  const [t, key] = gentle();
  await speak(t, 'id-ID', 1, { key });
}

/* ---------- Navigasi ---------- */
const Screens = {};
const history_ = [];
let cleanup = null;
let current = null;

function go(name, params = {}, { replace = false } = {}) {
  sessionToken++;
  stopSpeak();
  if (cleanup) { try { cleanup(); } catch (e) { /* abaikan */ } }
  cleanup = null;
  if (current && !replace) history_.push(current);
  current = { name, params };
  $app.innerHTML = '';
  window.scrollTo(0, 0);
  const res = Screens[name]($app, params, sessionToken);
  if (typeof res === 'function') cleanup = res;
}
function back() {
  const prev = history_.pop();
  if (!prev) {
    if (current && current.name !== 'home') { current = null; go('home'); return true; }
    return false;
  }
  current = null;
  go(prev.name, prev.params, { replace: true });
  return true;
}
function home() {
  history_.length = 0;
  current = null;
  go('home');
}

/** Bilah atas standar: tombol kembali, judul, jumlah bintang. */
function topbar(title, { onBack } = {}) {
  return h('div', { class: 'topbar' },
    h('button', { class: 'icon-btn', 'aria-label': 'Kembali', onclick: () => { Sfx.tap(); (onBack || back)(); } }, icon('back', 28)),
    h('h1', null, title),
    starPill());
}
function starPill() {
  return h('div', { class: 'stars', 'aria-label': 'Bintang' }, icon('star', 22), h('b', null, stars));
}

/**
 * Zayn sebagai "guru": avatar + gelembung kata. Teks di gelembung selalu mengikuti apa yang sedang diucapkan.
 * Sentuh Zayn untuk mendengar ulang kalimat terakhir.
 */
function coach(text, { size = 56 } = {}) {
  const txt = h('div', { class: 'coach-text' }, text || '');
  const el = h('div', { class: 'coach' }, zayn(size), h('div', { class: 'bubble' }, txt));
  el.addEventListener('click', () => { const t = txt.textContent; if (t && !/[\u0600-\u06FF]/.test(t)) speak(t); });
  return el;
}

/** Tombol pilihan segmen (misal: tingkat kesulitan). */
function segmented(options, value, onChange, label) {
  const wrap = h('div', { class: 'seg' });
  const render = () => {
    wrap.innerHTML = '';
    if (label) wrap.append(h('span', { class: 'seg-label' }, label));
    options.forEach(([val, label]) => {
      wrap.append(h('button', {
        class: val === value ? 'on' : '',
        onclick: () => { Sfx.tap(); value = val; render(); onChange(val); },
      }, label));
    });
  };
  render();
  return wrap;
}

/**
 * Kartu menu: ilustrasi, judul, dan keterangan singkat.
 * items: [screen, params, artName, judul, keterangan, warna]
 */
function menuGrid(items, cls = '') {
  const grid = h('div', { class: 'menu-grid ' + cls });
  items.forEach(([screen, params, artName, title, sub, tint], k) => {
    grid.append(h('button', {
      class: 'menu-card',
      style: { '--tint': tint, animationDelay: k * 40 + 'ms' },
      onclick: () => { Sfx.tap(); go(screen, params); },
    },
    h('div', { class: 'menu-art' }, art(artName, 64)),
    h('div', { class: 'menu-title' }, title),
    sub ? h('div', { class: 'menu-sub' }, sub) : null));
  });
  return grid;
}
