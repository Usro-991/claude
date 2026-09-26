/* Dunia Ceria — data belajar */
'use strict';

/* ---------- Angka ---------- */
const NUM_WORDS = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];
function numWord(n) {
  if (n <= 10) return NUM_WORDS[n];
  if (n === 11) return 'sebelas';
  if (n < 20) return NUM_WORDS[n - 10] + ' belas';
  if (n === 100) return 'seratus';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const t = (tens === 1 ? 'se' : NUM_WORDS[tens] + ' ') + 'puluh';
  return ones ? t + ' ' + NUM_WORDS[ones] : t;
}

/** Benda untuk dihitung: [emoji, nama] */
const COUNT_THINGS = [
  ['🍎', 'apel'], ['⭐', 'bintang'], ['🐤', 'anak ayam'], ['🎈', 'balon'], ['🍌', 'pisang'],
  ['🐟', 'ikan'], ['🌸', 'bunga'], ['🚗', 'mobil'], ['🦋', 'kupu-kupu'], ['🍓', 'stroberi'],
  ['⚽', 'bola'], ['🐞', 'kepik'], ['🧁', 'kue'], ['🐱', 'kucing'], ['🍊', 'jeruk'],
];

/* ---------- Huruf Hijaiyah ----------
 * ch: huruf, name: nama latin, say: nama dalam tulisan Arab (untuk suara),
 * c: bunyi konsonan latin (untuk harakat), fa: bacaan fathah khas Indonesia (misal "kho", "ro"),
 * alone/start/mid/end: bentuk huruf
 */
const HIJAIYAH = [
  { ch: 'ا', name: 'Alif', say: 'أَلِف', c: '', fa: 'a' },
  { ch: 'ب', name: 'Ba', say: 'بَاء', c: 'b', fa: 'ba' },
  { ch: 'ت', name: 'Ta', say: 'تَاء', c: 't', fa: 'ta' },
  { ch: 'ث', name: 'Tsa', say: 'ثَاء', c: 'ts', fa: 'tsa' },
  { ch: 'ج', name: 'Jim', say: 'جِيم', c: 'j', fa: 'ja' },
  { ch: 'ح', name: 'Ha', say: 'حَاء', c: 'h', fa: 'ha' },
  { ch: 'خ', name: 'Kho', say: 'خَاء', c: 'kh', fa: 'kho' },
  { ch: 'د', name: 'Dal', say: 'دَال', c: 'd', fa: 'da' },
  { ch: 'ذ', name: 'Dzal', say: 'ذَال', c: 'dz', fa: 'dza' },
  { ch: 'ر', name: 'Ro', say: 'رَاء', c: 'r', fa: 'ro' },
  { ch: 'ز', name: 'Zai', say: 'زَاي', c: 'z', fa: 'za' },
  { ch: 'س', name: 'Sin', say: 'سِين', c: 's', fa: 'sa' },
  { ch: 'ش', name: 'Syin', say: 'شِين', c: 'sy', fa: 'sya' },
  { ch: 'ص', name: 'Shod', say: 'صَاد', c: 'sh', fa: 'sho' },
  { ch: 'ض', name: 'Dhod', say: 'ضَاد', c: 'dh', fa: 'dho' },
  { ch: 'ط', name: 'Tho', say: 'طَاء', c: 'th', fa: 'tho' },
  { ch: 'ظ', name: 'Zho', say: 'ظَاء', c: 'zh', fa: 'zho' },
  { ch: 'ع', name: "'Ain", say: 'عَيْن', c: "'", fa: "'a" },
  { ch: 'غ', name: 'Ghoin', say: 'غَيْن', c: 'gh', fa: 'gho' },
  { ch: 'ف', name: 'Fa', say: 'فَاء', c: 'f', fa: 'fa' },
  { ch: 'ق', name: 'Qof', say: 'قَاف', c: 'q', fa: 'qo' },
  { ch: 'ك', name: 'Kaf', say: 'كَاف', c: 'k', fa: 'ka' },
  { ch: 'ل', name: 'Lam', say: 'لَام', c: 'l', fa: 'la' },
  { ch: 'م', name: 'Mim', say: 'مِيم', c: 'm', fa: 'ma' },
  { ch: 'ن', name: 'Nun', say: 'نُون', c: 'n', fa: 'na' },
  { ch: 'و', name: 'Wau', say: 'وَاو', c: 'w', fa: 'wa' },
  { ch: 'ه', name: 'Ha', say: 'هَاء', c: 'h', fa: 'ha' },
  { ch: 'لا', name: 'Lam Alif', say: 'لَام أَلِف', c: 'l', fa: 'laa', noHarakat: true },
  { ch: 'ء', name: 'Hamzah', say: 'هَمْزَة', c: "'", fa: "'a" },
  { ch: 'ي', name: 'Ya', say: 'يَاء', c: 'y', fa: 'ya' },
];
// Alif diberi harakat melalui hamzah di atas/bawahnya
HIJAIYAH[0].harakat = ['أَ', 'إِ', 'أُ'];

const FATHAH = 'َ';
const KASRAH = 'ِ';
const DHAMMAH = 'ُ';

function harakatOf(L) {
  if (L.harakat) return L.harakat;
  return [L.ch + FATHAH, L.ch + KASRAH, L.ch + DHAMMAH];
}
function harakatLatin(L) {
  return [L.fa, L.c + 'i', L.c + 'u'];
}

// Huruf yang tidak bisa disambung ke huruf sesudahnya
const NON_JOINING = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و', 'ء', 'لا']);
const ZWJ = '‍';
function letterForms(ch) {
  if (ch === 'ء') return [['Sendiri', 'ء']];
  if (NON_JOINING.has(ch)) {
    return [['Sendiri', ch], ['Akhir', ZWJ + ch]];
  }
  return [['Sendiri', ch], ['Awal', ch + ZWJ], ['Tengah', ZWJ + ch + ZWJ], ['Akhir', ZWJ + ch]];
}

/* ---------- Huruf ABC ---------- */
const ABC = [
  ['A', 'Ayam', '🐔'], ['B', 'Bola', '⚽'], ['C', 'Cicak', '🦎'], ['D', 'Domba', '🐑'],
  ['E', 'Elang', '🦅'], ['F', 'Flamingo', '🦩'], ['G', 'Gajah', '🐘'], ['H', 'Harimau', '🐅'],
  ['I', 'Ikan', '🐟'], ['J', 'Jeruk', '🍊'], ['K', 'Kucing', '🐱'], ['L', 'Lebah', '🐝'],
  ['M', 'Monyet', '🐒'], ['N', 'Nanas', '🍍'], ['O', 'Obat', '💊'], ['P', 'Pisang', '🍌'],
  ['Q', "Qur'an", '📖'], ['R', 'Rusa', '🦌'], ['S', 'Sapi', '🐄'], ['T', 'Tomat', '🍅'],
  ['U', 'Ular', '🐍'], ['V', 'Violin', '🎻'], ['W', 'Wortel', '🥕'], ['X', 'Xilofon', '🎶'],
  ['Y', 'Yoyo', '🪀'], ['Z', 'Zebra', '🦓'],
];
// Cara baca huruf dalam bahasa Indonesia
const ABC_SAY = {
  A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'ef', G: 'ge', H: 'ha', I: 'i', J: 'je', K: 'ka', L: 'el', M: 'em',
  N: 'en', O: 'o', P: 'pe', Q: 'ki', R: 'er', S: 'es', T: 'te', U: 'u', V: 've', W: 'we', X: 'eks', Y: 'ye', Z: 'zet',
};

/* ---------- Hewan ---------- */
const ANIMALS = [
  ['🐱', 'Kucing', 'Meong, meong'], ['🐶', 'Anjing', 'Guk, guk'], ['🐄', 'Sapi', 'Mooo'],
  ['🐐', 'Kambing', 'Mbeek'], ['🐔', 'Ayam', 'Kukuruyuk'], ['🦆', 'Bebek', 'Kwek, kwek'],
  ['🐸', 'Katak', 'Kwok, kwok'], ['🦁', 'Singa', 'Aummm'], ['🐘', 'Gajah', 'Prooot'],
  ['🐒', 'Monyet', 'Uuk, aak'], ['🐑', 'Domba', 'Mbeek'], ['🐴', 'Kuda', 'Hiiiik'],
  ['🐝', 'Lebah', 'Nguung'], ['🐍', 'Ular', 'Sssss'], ['🦉', 'Burung Hantu', 'Kuk, kuk'],
  ['🐟', 'Ikan', 'Blub, blub'], ['🐰', 'Kelinci', 'Hop, hop'], ['🐯', 'Harimau', 'Aummm'],
  ['🐪', 'Unta', 'Grooo'], ['🐢', 'Kura-kura', 'Pelan, pelan'],
];

/* ---------- Warna ---------- */
const COLOR_LIST = [
  ['Merah', '#FF4B4B'], ['Kuning', '#FFD23F'], ['Biru', '#2F80ED'], ['Hijau', '#3CC45B'],
  ['Oranye', '#FF8A1F'], ['Ungu', '#9B51E0'], ['Merah muda', '#FF7EB6'], ['Cokelat', '#8B5A2B'],
  ['Hitam', '#222222'], ['Putih', '#FFFFFF'],
];

/* ---------- Bentuk ---------- */
const SHAPES = [
  ['Lingkaran', '<circle cx="50" cy="50" r="42"/>'],
  ['Persegi', '<rect x="12" y="12" width="76" height="76" rx="4"/>'],
  ['Segitiga', '<polygon points="50,8 94,90 6,90"/>'],
  ['Persegi panjang', '<rect x="4" y="26" width="92" height="48" rx="4"/>'],
  ['Bintang', '<polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"/>'],
  ['Hati', '<path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z"/>'],
  ['Oval', '<ellipse cx="50" cy="50" rx="44" ry="30"/>'],
  ['Belah ketupat', '<polygon points="50,4 92,50 50,96 8,50"/>'],
];
function shapeSvg(inner, color) {
  return `<svg viewBox="0 0 100 100"><g fill="${color}" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linejoin="round">${inner}</g></svg>`;
}
