/* Dunia Ceria — inti aplikasi: elemen, suara, TTS, efek, navigasi */
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
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
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
  { rate: 0.85, sound: true, voice: true, slow: 1 },
  Store.get('settings', {})
);
function saveSettings() { Store.set('settings', Settings); }

/* ---------- Token sesi: membatalkan urutan animasi saat pindah layar ---------- */
let sessionToken = 0;
const alive = (tok) => tok === sessionToken;
function sleep(ms, tok) {
  return new Promise((res) => setTimeout(() => res(tok == null || alive(tok)), ms));
}

/* ---------- Text-to-speech ---------- */
const TTS = (window.capacitorTextToSpeech && window.capacitorTextToSpeech.TextToSpeech) || null;
const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

function webSpeak(text, lang, rate) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1.15;
    const voices = speechSynthesis.getVoices();
    const base = lang.slice(0, 2);
    const v = voices.find((x) => x.lang === lang) || voices.find((x) => x.lang && x.lang.startsWith(base));
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

/**
 * Ucapkan teks. lang: 'id-ID' (bawaan) atau 'ar-SA' untuk bahasa Arab.
 * Selalu resolve (tidak pernah gagal), sehingga urutan animasi tetap berjalan tanpa suara.
 */
async function speak(text, lang = 'id-ID', rateMul = 1) {
  if (!Settings.voice || !text) return;
  const rate = Math.max(0.3, Settings.rate * rateMul);
  try {
    if (TTS && isNative) {
      await TTS.stop().catch(() => {});
      await TTS.speak({ text, lang, rate, pitch: 1.15, volume: 1, category: 'playback', queueStrategy: 0 });
      return;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    await webSpeak(text, lang, rate);
  } catch (e) {
    /* suara bahasa ini mungkin belum terpasang di HP */
  }
}
function stopSpeak() {
  try {
    if (TTS && isNative) TTS.stop().catch(() => {});
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  } catch (e) { /* abaikan */ }
}
// Beberapa browser memuat daftar suara secara asinkron
if ('speechSynthesis' in window) speechSynthesis.getVoices();

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

/* ---------- Efek perayaan ---------- */
const PRAISE = ['Hebat!', 'Pintar!', 'Bagus sekali!', 'Luar biasa!', 'Keren!', 'Mantap!', 'Masya Allah, pintar!'];
const COLORS = ['#FF5A5F', '#FFB938', '#5CC85C', '#3FA9F5', '#9B6BFF', '#FF7EB6', '#2EC4B6'];

function confetti(n = 40) {
  for (let i = 0; i < n; i++) {
    const c = h('div', {
      class: 'confetti',
      style: {
        left: Math.random() * 100 + 'vw',
        background: pick(COLORS),
        animationDuration: 1.6 + Math.random() * 1.6 + 's',
        animationDelay: Math.random() * 0.4 + 's',
      },
    });
    $fx.append(c);
    setTimeout(() => c.remove(), 3800);
  }
}
async function celebrate(text, { star = true, say = true } = {}) {
  const word = text || pick(PRAISE);
  Sfx.good();
  confetti();
  const el = h('div', { class: 'cheer' }, (star ? '⭐ ' : '') + word);
  $fx.append(el);
  setTimeout(() => el.remove(), 1500);
  if (star) addStar();
  if (say) await speak(word.replace('⭐', ''));
}
async function tryAgain(say = 'Coba lagi, ya') {
  Sfx.soft();
  if (say) await speak(say);
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
function topbar(title, { onBack, sayTitle = true } = {}) {
  const bar = h('div', { class: 'topbar' },
    h('button', { class: 'round-btn', 'aria-label': 'Kembali', onclick: () => { Sfx.tap(); (onBack || back)(); } }, '⬅️'),
    h('h1', { onclick: () => speak(title.replace(/[^\p{L}\p{N}\s,!?]/gu, '')) }, title),
    h('div', { class: 'stars' }, '⭐', h('b', null, stars))
  );
  if (sayTitle) speak(title.replace(/[^\p{L}\p{N}\s,!?]/gu, ''));
  return bar;
}

/** Tombol pilihan segmen (misal: tingkat kesulitan). */
function segmented(options, value, onChange) {
  const wrap = h('div', { class: 'seg' });
  const render = () => {
    wrap.innerHTML = '';
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
