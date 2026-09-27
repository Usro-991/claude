/* Belajar bersama Zayn — pengaturan suara & rekam suara sendiri (untuk orang tua) */
'use strict';

/* ---------- Kelompok kalimat yang bisa direkam ---------- */
const capWord = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const REC_GROUPS = [
  {
    id: 'num', title: 'Angka',
    hint: 'Ucapkan angkanya dengan jelas dan ceria, seperti sedang menghitung bersama anak.',
    items: () => Array.from({ length: 20 }, (_, k) => ({ key: 'num:' + (k + 1), text: capWord(numWord(k + 1)), badge: String(k + 1) })),
  },
  {
    id: 'hij', title: 'Hijaiyah',
    hint: 'Sebutkan nama hurufnya saja, misalnya "Alif", "Ba", "Ta".',
    items: () => HIJAIYAH.map((L, i) => ({ key: 'hij:' + i, text: L.name, badge: L.ch, arab: true })),
  },
  {
    id: 'har', title: 'Harakat',
    hint: 'Baca pendek seperti mengaji Iqro: "a", "ba", "ta"… lalu "i", "bi", "ti"…',
    sub: [[0, 'Fathah'], [1, 'Kasrah'], [2, 'Dhammah']],
    items: (m = 0) => HIJAIYAH.map((L, i) => [L, i]).filter(([L]) => !L.noHarakat)
      .map(([L, i]) => ({ key: 'har:' + i + ':' + m, text: harakatLatin(L)[m], badge: harakatOf(L)[m], arab: true })),
  },
  {
    id: 'praise', title: 'Pujian',
    hint: 'Diputar saat anak menjawab benar. Silakan ucapkan dengan gaya Ayah/Bunda sendiri.',
    items: () => PRAISE.map((t, k) => ({ key: 'praise:' + k, text: t })),
  },
  {
    id: 'gentle', title: 'Menyemangati',
    hint: 'Diputar saat jawaban anak belum tepat. Ucapkan dengan lembut.',
    items: () => GENTLE.map((t, k) => ({ key: 'gentle:' + k, text: t })),
  },
];

/* ---------- Perekam ---------- */
const Recorder = {
  stream: null,
  rec: null,
  timer: null,
  async start(onStop) {
    if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error('unsupported');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const chunks = [];
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    this.rec = type ? new MediaRecorder(this.stream, { mimeType: type }) : new MediaRecorder(this.stream);
    this.rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    this.rec.onstop = () => {
      this.stream.getTracks().forEach((t) => t.stop());
      clearTimeout(this.timer);
      const blob = new Blob(chunks, { type: this.rec.mimeType || 'audio/webm' });
      this.rec = null;
      onStop(blob);
    };
    this.rec.start();
    // Batas aman 8 detik per rekaman
    this.timer = setTimeout(() => this.stop(), 8000);
  },
  stop() { if (this.rec && this.rec.state !== 'inactive') this.rec.stop(); },
  get active() { return !!this.rec; },
};

/* ================= Pengaturan suara ================= */
function voiceLabel(v, n) {
  const raw = v.name || v.voiceURI || '';
  const online = v.localService === false || /network/i.test(raw);
  // Nama suara Android berupa kode (misal id-id-x-dfz-local), jadi diberi nama yang ramah
  const friendly = /^[a-z]{2}-[a-z]{2}-x-/i.test(raw) ? 'Suara ' + n : raw.replace(/\s*\(.*\)$/, '');
  return friendly + (online ? ' · lebih halus, perlu internet' : ' · offline');
}

function voicePicker(lang, settingKey, sample) {
  const wrap = h('div', { class: 'voice-list' });
  const render = () => {
    wrap.innerHTML = '';
    const list = voicesFor(lang);
    const opts = [{ label: 'Bawaan HP', uri: '' }, ...list.map(({ v }, k) => ({ label: voiceLabel(v, k + 1), uri: v.voiceURI || v.name }))];
    if (!list.length) wrap.append(h('p', { class: 'muted' }, 'Belum ada suara tambahan untuk bahasa ini di HP.'));
    opts.forEach((o) => {
      const on = (Settings[settingKey] || '') === o.uri;
      wrap.append(h('div', { class: 'voice-row' + (on ? ' on' : '') },
        h('button', {
          class: 'voice-pick',
          onclick: () => { Settings[settingKey] = o.uri; saveSettings(); render(); speak(sample, lang, 1, { show: false }); },
        }, h('span', { class: 'radio' }), h('span', null, o.label)),
        h('button', {
          class: 'icon-btn small', 'aria-label': 'Dengarkan',
          onclick: async () => {
            const prev = Settings[settingKey];
            Settings[settingKey] = o.uri;
            await speak(sample, lang, 1, { show: false });
            Settings[settingKey] = prev;
          },
        }, icon('sound', 22))));
    });
  };
  render();
  loadVoices().then(render);
  return wrap;
}

Screens['voice-settings'] = (root) => {
  root.append(topbar('Suara Zayn'));
  const range = (label, key, min, max, stepV, fmt) => {
    const out = h('b', null, fmt(Settings[key]));
    const input = h('input', { type: 'range', min, max, step: stepV, value: Settings[key], 'aria-label': label });
    input.addEventListener('input', () => { Settings[key] = +input.value; out.textContent = fmt(Settings[key]); saveSettings(); });
    input.addEventListener('change', () => speak('Halo, aku Zayn. Ayo kita belajar!', 'id-ID', 1, { show: false }));
    return h('div', { class: 'field' }, h('div', { class: 'field-label' }, label, out), input);
  };
  const useRec = h('input', { type: 'checkbox', class: 'switch' });
  useRec.checked = !!Settings.useRec;
  useRec.addEventListener('change', () => { Settings.useRec = useRec.checked; saveSettings(); });

  const total = REC_GROUPS.reduce((n, g) => n + Rec.count(g.id + ':'), 0);
  root.append(
    h('div', { class: 'panel' },
      h('div', { class: 'rec-hero' },
        h('div', { class: 'rec-hero-ic' }, icon('mic', 34)),
        h('div', null,
          h('div', { class: 'about-title' }, 'Rekam suara sendiri'),
          h('p', { class: 'muted' }, 'Cara paling alami: suara Ayah atau Bunda yang dipakai untuk angka, huruf hijaiyah, dan pujian. Suara mesin hanya dipakai untuk kalimat yang belum direkam.'))),
      h('button', { class: 'btn warm', onclick: () => go('voice-rec') }, icon('mic', 22), total ? `Lanjut merekam (${total} tersimpan)` : 'Mulai merekam'),
      h('label', { class: 'field row-field' }, h('span', null, 'Pakai rekaman suara sendiri'), useRec)),
    h('div', { class: 'panel' },
      h('div', { class: 'about-title' }, 'Pilih suara Indonesia'),
      h('p', { class: 'muted' }, 'Coba dengarkan satu per satu, lalu pilih yang paling enak didengar. Suara bertanda "lebih halus" biasanya terdengar paling alami.'),
      voicePicker('id-ID', 'voiceId', 'Halo! Aku Zayn. Satu, dua, tiga. Pintar sekali!'),
      range('Kecepatan bicara', 'rate', 0.6, 1.2, 0.05, (v) => Math.round(v * 100) + '%'),
      range('Tinggi suara', 'pitch', 0.8, 1.3, 0.05, (v) => (v < 0.95 ? 'rendah' : v > 1.1 ? 'tinggi' : 'normal'))),
    h('div', { class: 'panel' },
      h('div', { class: 'about-title' }, 'Pilih suara Arab'),
      voicePicker('ar-SA', 'voiceAr', 'أَلِف، بَاء، تَاء'),
      h('p', { class: 'muted' }, 'Kalau daftar ini kosong: Pengaturan HP → Sistem → Bahasa & input → Output text-to-speech → Google → Instal data suara → Arab.'))
  );
};

/* ================= Rekam suara sendiri ================= */
Screens['voice-rec'] = (root, { g = 'num', m = 0 } = {}) => {
  const G = REC_GROUPS.find((x) => x.id === g) || REC_GROUPS[0];
  root.append(topbar('Rekam Suara'),
    segmented(REC_GROUPS.map((x) => [x.id, x.title]), G.id, (v) => go('voice-rec', { g: v }, { replace: true })));
  if (G.sub) root.append(segmented(G.sub, m, (v) => go('voice-rec', { g: G.id, m: v }, { replace: true })));

  const items = G.items(m);
  const progress = h('b');
  const updateProgress = () => { progress.textContent = items.filter((it) => Rec.has(it.key)).length + ' / ' + items.length; };
  root.append(h('div', { class: 'rec-tip' },
    icon('help', 22),
    h('div', null, G.hint, ' Tekan tombol merah, bacakan, lalu tekan lagi untuk berhenti. Rekam di tempat yang tenang, ya.'),
    h('div', { class: 'rec-progress' }, progress)));
  updateProgress();

  const list = h('div', { class: 'rec-list' });
  let activeRow = null;
  items.forEach((it) => {
    const row = h('div', { class: 'rec-row' + (Rec.has(it.key) ? ' done' : '') });
    const recBtn = h('button', { class: 'rec-btn', 'aria-label': 'Rekam' }, icon('mic', 24));
    const playBtn = h('button', { class: 'icon-btn small', 'aria-label': 'Putar' }, icon('play', 20));
    const delBtn = h('button', { class: 'icon-btn small', 'aria-label': 'Hapus rekaman' }, icon('trash', 20));
    const refresh = () => {
      const has = Rec.has(it.key);
      row.classList.toggle('done', has);
      playBtn.disabled = !has;
      delBtn.disabled = !has;
      updateProgress();
    };
    recBtn.addEventListener('click', async () => {
      if (Recorder.active) {
        if (activeRow === row) Recorder.stop();
        return;
      }
      stopSpeak();
      try {
        activeRow = row;
        row.classList.add('recording');
        recBtn.replaceChildren(icon('stop', 22));
        await Recorder.start(async (blob) => {
          row.classList.remove('recording');
          recBtn.replaceChildren(icon('mic', 24));
          activeRow = null;
          if (blob.size > 800) {
            await Rec.set(it.key, blob);
            refresh();
            playClip(it.key);
          }
        });
      } catch (e) {
        row.classList.remove('recording');
        recBtn.replaceChildren(icon('mic', 24));
        activeRow = null;
        alert('Mikrofon belum bisa dipakai. Izinkan akses mikrofon untuk aplikasi ini di Pengaturan HP, lalu coba lagi.');
      }
    });
    playBtn.addEventListener('click', () => { stopSpeak(); playClip(it.key); });
    delBtn.addEventListener('click', async () => { await Rec.del(it.key); refresh(); });
    row.append(
      it.badge ? h('div', { class: 'rec-badge' + (it.arab ? ' arab' : '') }, it.badge) : null,
      h('div', { class: 'rec-text' }, it.text, h('span', { class: 'rec-check' }, icon('check', 18))),
      recBtn, playBtn, delBtn);
    list.append(row);
    refresh();
  });
  root.append(list);
  return () => Recorder.stop();
};
