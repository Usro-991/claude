/* Belajar bersama Zayn — ikon SVG, ilustrasi menu, dan maskot Zayn */
'use strict';

/* ---------- Ikon antarmuka (garis, 24×24) ---------- */
const ICON_PATHS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke-linejoin="round"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>',
  replay: '<path d="M4 12a8 8 0 108-8 8.2 8.2 0 00-6 2.7"/><path d="M5 3v4.5h4.5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke-linejoin="round"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/>',
  pencil: '<path d="M4 20l1.2-4.6L16 4.6a2 2 0 012.8 0l.6.6a2 2 0 010 2.8L8.6 18.8z" stroke-linejoin="round"/><path d="M14 6.5l3.5 3.5"/>',
  eraser: '<path d="M8.5 19.5L3.8 14.8a1.8 1.8 0 010-2.6l8.4-8.4a1.8 1.8 0 012.6 0l5.4 5.4a1.8 1.8 0 010 2.6l-7.9 7.7z" stroke-linejoin="round"/><path d="M8 9.5l6.5 6.5M8.5 19.5H20"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
  trash: '<path d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13"/>',
  save: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M4 17.5l5-4.5 4 3.5 3-2.5 4.5 3.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" fill="currentColor" stroke-linejoin="round"/>',
  help: '<path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.2-1.5 2.3"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/><circle cx="12" cy="12" r="9"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M8.5 21h7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
};

function icon(name, size = 26) {
  const span = document.createElement('span');
  span.className = 'ic';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
  return span;
}

/* ---------- Ilustrasi menu (datar, 72×72) ---------- */
const ART = {
  count: `
    <rect x="6" y="36" width="28" height="28" rx="7" fill="#FF7A59"/><text x="20" y="57" font-size="20" font-family="Fredoka" font-weight="700" fill="#fff" text-anchor="middle">1</text>
    <rect x="38" y="36" width="28" height="28" rx="7" fill="#4DA3FF"/><text x="52" y="57" font-size="20" font-family="Fredoka" font-weight="700" fill="#fff" text-anchor="middle">2</text>
    <rect x="22" y="6" width="28" height="28" rx="7" fill="#FFC53D"/><text x="36" y="27" font-size="20" font-family="Fredoka" font-weight="700" fill="#5A3A00" text-anchor="middle">3</text>`,
  hijaiyah: `
    <path d="M8 16c9-4 19-3 28 3v44c-9-6-19-7-28-3z" fill="#fff" stroke="#1F6F5C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M64 16c-9-4-19-3-28 3v44c9-6 19-7 28-3z" fill="#E7FBF4" stroke="#1F6F5C" stroke-width="3" stroke-linejoin="round"/>
    <text x="50" y="47" font-size="26" font-family="Noto Naskh Arabic" font-weight="700" fill="#1F6F5C" text-anchor="middle">ب</text>
    <circle cx="20" cy="34" r="3" fill="#FFC53D"/><circle cx="24" cy="44" r="2" fill="#FF7A59"/>`,
  draw: `
    <path d="M36 8C18 8 6 20 6 35c0 13 10 20 18 18 6-2 3-9 9-10 8-1 9 7 17 6 9-1 16-9 16-18C66 18 52 8 36 8z" fill="#FFE3C2"/>
    <circle cx="22" cy="28" r="5" fill="#FF5A5F"/><circle cx="36" cy="20" r="5" fill="#FFC53D"/><circle cx="50" cy="26" r="5" fill="#34C3A0"/><circle cx="52" cy="40" r="5" fill="#4DA3FF"/>
    <path d="M40 66l18-26 5 3-15 28z" fill="#8C5A3C"/><path d="M58 40l4-6 5 3-4 6z" fill="#FF5A5F"/>`,
  write: `
    <path d="M10 58c8-10 14-20 22-20s6 14 14 14 10-10 16-16" fill="none" stroke="#C9B6F5" stroke-width="4" stroke-dasharray="1 7" stroke-linecap="round"/>
    <path d="M20 52l6-18 26-26 12 12-26 26z" fill="#FFC53D"/><path d="M46 14l6-6 12 12-6 6z" fill="#FF7EB6"/><path d="M20 52l6-18 12 12z" fill="#FFE3C2"/><path d="M20 52l3-9 6 6z" fill="#2B2A44"/>`,
  abc: `
    <rect x="6" y="10" width="36" height="36" rx="9" fill="#4DA3FF"/><text x="24" y="38" font-size="26" font-family="Fredoka" font-weight="700" fill="#fff" text-anchor="middle">A</text>
    <rect x="30" y="30" width="36" height="36" rx="9" fill="#FF7EB6"/><text x="48" y="57" font-size="26" font-family="Fredoka" font-weight="700" fill="#fff" text-anchor="middle">b</text>`,
  animals: `
    <path d="M14 14l12 12M58 14L46 26" stroke="#E98A3B" stroke-width="10" stroke-linecap="round"/>
    <circle cx="36" cy="40" r="25" fill="#FFB25B"/>
    <circle cx="27" cy="37" r="3.5" fill="#2B2A44"/><circle cx="45" cy="37" r="3.5" fill="#2B2A44"/>
    <ellipse cx="36" cy="46" rx="4" ry="3" fill="#FF7A59"/>
    <path d="M30 51c3 3 9 3 12 0" stroke="#2B2A44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M12 44h10M12 50l10-2M60 44H50M60 50l-10-2" stroke="#8C5A3C" stroke-width="2" stroke-linecap="round"/>`,
  colors: `
    <circle cx="28" cy="28" r="18" fill="#FF5A5F" opacity=".9"/><circle cx="44" cy="28" r="18" fill="#4DA3FF" opacity=".85"/><circle cx="36" cy="43" r="18" fill="#FFC53D" opacity=".85"/>`,
  shapes: `
    <circle cx="22" cy="24" r="14" fill="#34C3A0"/><path d="M50 8l16 28H34z" fill="#FF7A59" stroke-linejoin="round"/><rect x="26" y="40" width="26" height="26" rx="5" fill="#8C7CFF"/>`,
  memory: `
    <rect x="8" y="14" width="30" height="42" rx="7" fill="#4DA3FF" transform="rotate(-10 23 35)"/>
    <rect x="34" y="14" width="30" height="42" rx="7" fill="#fff" stroke="#E2D8CA" stroke-width="3" transform="rotate(8 49 35)"/>
    <path d="M49 28l2.5 5 5.5.8-4 3.8 1 5.4-5-2.6-5 2.6 1-5.4-4-3.8 5.5-.8z" fill="#FFC53D" transform="rotate(8 49 35)"/>`,
  balloon: `
    <path d="M24 44c0 6 2 14-4 22M48 40c0 8 4 14 2 24" stroke="#9A8C7A" stroke-width="2" fill="none"/>
    <ellipse cx="24" cy="26" rx="15" ry="18" fill="#FF5A5F"/><ellipse cx="48" cy="24" rx="15" ry="18" fill="#FFC53D"/>
    <ellipse cx="19" cy="19" rx="4" ry="6" fill="#fff" opacity=".45"/><ellipse cx="43" cy="17" rx="4" ry="6" fill="#fff" opacity=".45"/>`,
  ear: `
    <circle cx="36" cy="36" r="28" fill="#DCEBFF"/><path d="M26 30a10 10 0 0120 0c0 8-8 8-8 16a6 6 0 01-11 2" fill="none" stroke="#2F6FD1" stroke-width="5" stroke-linecap="round"/>`,
  play: `
    <circle cx="36" cy="36" r="28" fill="#FFE9D6"/><path d="M29 22v28l22-14z" fill="#FF7A59" stroke="#FF7A59" stroke-width="4" stroke-linejoin="round"/>`,
  harakat: `
    <rect x="8" y="8" width="56" height="56" rx="14" fill="#EFEAFF"/><text x="36" y="52" font-size="36" font-family="Noto Naskh Arabic" font-weight="700" fill="#5B4BD1" text-anchor="middle">بَ</text>`,
  plus: `
    <circle cx="36" cy="36" r="28" fill="#EFEAFF"/><path d="M36 22v28M22 36h28" stroke="#6C5CE7" stroke-width="8" stroke-linecap="round"/>`,
  minus: `
    <circle cx="36" cy="36" r="28" fill="#FFE4EF"/><path d="M22 36h28" stroke="#E0457B" stroke-width="8" stroke-linecap="round"/>`,
  eye: `
    <path d="M6 36s11-18 30-18 30 18 30 18-11 18-30 18S6 36 6 36z" fill="#FFF1DA"/><circle cx="36" cy="36" r="11" fill="#6B4A2E"/><circle cx="36" cy="36" r="5" fill="#1B1B1B"/><circle cx="40" cy="32" r="2.5" fill="#fff"/>`,
  finger: `
    <circle cx="36" cy="36" r="28" fill="#E3F8EF"/><path d="M31 50V24a4 4 0 018 0v14l7 1.5c3 .6 4.5 3.5 3.8 6.5L48 54H33l-6-8c-1.5-2 1-4.5 3-3z" fill="#FFD2B0" stroke="#C98A60" stroke-width="2.5" stroke-linejoin="round"/>`,
  think: `
    <circle cx="36" cy="36" r="28" fill="#DCEBFF"/><text x="36" y="48" font-size="34" font-family="Fredoka" font-weight="700" fill="#2F6FD1" text-anchor="middle">?</text>`,
  order: `
    <rect x="6" y="26" width="18" height="20" rx="5" fill="#34C3A0"/><rect x="27" y="26" width="18" height="20" rx="5" fill="#fff" stroke="#34C3A0" stroke-width="3" stroke-dasharray="4 3"/><rect x="48" y="26" width="18" height="20" rx="5" fill="#34C3A0"/>
    <text x="15" y="41" font-size="13" font-family="Fredoka" font-weight="700" fill="#fff" text-anchor="middle">4</text><text x="36" y="41" font-size="13" font-family="Fredoka" font-weight="700" fill="#34C3A0" text-anchor="middle">?</text><text x="57" y="41" font-size="13" font-family="Fredoka" font-weight="700" fill="#fff" text-anchor="middle">6</text>`,
};

function art(name, size = 72) {
  const span = document.createElement('span');
  span.className = 'art';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 72 72" width="${size}" height="${size}">${ART[name]}</svg>`;
  return span;
}

/* ---------- Maskot Zayn: anak laki-laki berpeci, bisa berkedip & "bicara" ---------- */
const ZAYN_SVG = `
<svg viewBox="0 0 120 120" class="zayn-svg">
  <circle cx="60" cy="64" r="54" fill="var(--zayn-bg, #FFE3C7)"/>
  <circle cx="23" cy="70" r="8" fill="#EDB189"/><circle cx="97" cy="70" r="8" fill="#EDB189"/>
  <circle cx="60" cy="68" r="37" fill="#F6C6A0"/>
  <path d="M24 60c0-18 15-30 36-30s36 12 36 30c-6-6-12-9-19-9-4 0-6 3-17 3s-13-3-17-3c-7 0-13 3-19 9z" fill="#3A2418"/>
  <path d="M28 44c2-12 15-20 32-20s30 8 32 20c-9-3-20-5-32-5s-23 2-32 5z" fill="#FFFFFF" stroke="#E6DCCF" stroke-width="2"/>
  <path d="M33 38c8-2 18-3 27-3s19 1 27 3" stroke="#34C3A0" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="3 4"/>
  <path d="M40 58q6-4 12 0M68 58q6-4 12 0" stroke="#3A2418" stroke-width="3" fill="none" stroke-linecap="round"/>
  <g class="z-eyes">
    <ellipse cx="46" cy="68" rx="4.6" ry="5.6" fill="#2A1A12"/><ellipse cx="74" cy="68" rx="4.6" ry="5.6" fill="#2A1A12"/>
    <circle cx="47.6" cy="66" r="1.7" fill="#fff"/><circle cx="75.6" cy="66" r="1.7" fill="#fff"/>
  </g>
  <circle cx="37" cy="80" r="6" fill="#FF8FA3" opacity=".45"/><circle cx="83" cy="80" r="6" fill="#FF8FA3" opacity=".45"/>
  <path d="M58 72q2 3 4 0" stroke="#D99471" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path class="z-smile" d="M49 84q11 10 22 0" stroke="#7A3B2A" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path class="z-talk" d="M50 83q10 -2 20 0q-2 11 -10 11t-10 -11z" fill="#7A3B2A"/>
</svg>`;

function zayn(size = 64, cls = '') {
  const el = document.createElement('div');
  el.className = 'zayn ' + cls;
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.innerHTML = ZAYN_SVG;
  return el;
}
