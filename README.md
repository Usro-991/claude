# Dunia Ceria 🌟

Aplikasi Android untuk belajar sambil bermain, untuk anak usia **1–7 tahun**.
Tanpa iklan, tanpa internet, dan tanpa login. Tombolnya besar, setiap layar bersuara, dan
anak tidak pernah "kalah": kalau jawabannya salah, aplikasi mengajak menghitung ulang pelan-pelan.

## Isi aplikasi

| Menu | Untuk usia | Isi |
|---|---|---|
| 🔢 **Berhitung** | 1–7 th | **Kenal Angka**: benda muncul satu per satu, diberi nomor, dan diucapkan perlahan ("satu… dua… tiga…"), lalu ditutup dengan kotak sepuluh (ten-frame). Rentang 1–5, 1–10, atau 1–20. |
| | 2–7 th | **Hitung Sendiri**: anak menyentuh tiap benda sambil menghitung, lalu menjawab "ada berapa?" |
| | 3–7 th | **Ada Berapa?**: tebak jumlah. Ada tombol 🔍 *Bantu hitung*, dan bantuan ini juga muncul otomatis bila jawabannya salah. |
| | 5–7 th | **Penjumlahan** dan **Pengurangan** dengan gambar benda, dijelaskan langkah demi langkah. |
| | 4–7 th | **Urutan Angka**: cari angka yang hilang (sampai 100). |
| ب **Huruf Hijaiyah** | 2–7 th | 30 huruf (termasuk لا dan ء) lengkap dengan nama, suara bahasa Arab, bentuk huruf di awal/tengah/akhir, dan harakat. |
| | 1–7 th | **Putar Pelan-pelan**: huruf diputar satu per satu secara otomatis, seperti Iqro. |
| | 4–7 th | **Harakat a-i-u** (fathah, kasrah, dhammah), bisa dibaca berurutan. |
| | 3–7 th | **Tebak Huruf**: dengarkan nama hurufnya, lalu pilih hurufnya. |
| 🎨 **Menggambar** | 1–7 th | Menggambar bebas dengan jari: 12 warna, warna pelangi, 3 ukuran kuas, penghapus, stempel, undo, dan galeri. |
| ✏️ **Menulis** | 4–7 th | Menebalkan garis putus-putus angka 0–9, huruf A–Z, dan huruf hijaiyah. |
| 🔤 Huruf ABC · 🦁 Hewan · 🌈 Warna · 🔺 Bentuk | 1–7 th | Kartu belajar yang bisa digeser, plus mode tebak. |
| 🃏 **Cocokkan Kartu** | 3–7 th | Permainan memori dengan 2 sampai 8 pasang kartu. |
| 🎈 **Pecah Balon** | 1–4 th | Untuk balita: sentuh balon, lalu dengarkan angka, huruf, hijaiyah, atau warnanya. |

Setiap jawaban benar memberi ⭐ bintang dan efek konfeti.

**Menu Orang Tua** (di bagian bawah beranda, dibuka dengan soal perkalian agar anak tidak bisa masuk):
nyalakan/matikan suara, atur kecepatan bicara, atur jeda berhitung supaya lebih pelan, dan uji suara Indonesia/Arab.

## Cara mendapatkan APK

APK dibangun otomatis oleh **GitHub Actions** setiap kali ada push:

1. Buka tab **Actions** di repositori GitHub, lalu pilih workflow **Build APK Android** yang terbaru.
2. Unduh artefak **DuniaCeria-apk** (berupa file zip yang berisi `DuniaCeria.apk`).
3. Salin file tersebut ke HP, lalu buka. Izinkan *"Instal dari sumber tidak dikenal"* bila diminta.

Kalau kamu membuat tag `v1.0.0` lalu push, APK juga otomatis dilampirkan di halaman **Releases**.

### Suara huruf hijaiyah

Aplikasi memakai mesin *text-to-speech* bawaan HP. Kalau huruf Arab tidak bersuara, buka
**Pengaturan HP → Sistem → Bahasa & input → Output text-to-speech → Google → Instal data suara → Arab**.
Kamu bisa mengecek statusnya di Menu Orang Tua.

## Build sendiri di komputer

Yang dibutuhkan: Node.js 22, JDK 21, dan Android SDK (atau Android Studio).

```bash
npm install
npm run sync          # salin aset web ke proyek Android
npm run build:apk     # hasilnya: android/app/build/outputs/apk/debug/app-debug.apk
# atau buka di Android Studio:
npx cap open android
```

Mencoba di browser (tanpa HP):

```bash
npm install && npm run vendor
npm run serve         # buka http://localhost:8080
```

## Struktur kode

```
www/                 aplikasi (HTML/CSS/JS murni, tanpa framework, berjalan offline)
  js/core.js         navigasi, suara (TTS), efek suara, bintang, konfeti
  js/data.js         data angka, hijaiyah, ABC, hewan, warna, bentuk
  js/counting.js     semua permainan berhitung
  js/hijaiyah.js     belajar huruf hijaiyah
  js/drawing.js      menggambar & menulis (tracing)
  js/games.js        kartu belajar, cocokkan kartu, pecah balon
  js/main.js         beranda & menu orang tua
android/             proyek Android (Capacitor)
assets/              sumber ikon & splash screen
```

Untuk menambah materi, cukup ubah `www/js/data.js`. Misalnya, tambahkan hewan baru ke `ANIMALS`.
