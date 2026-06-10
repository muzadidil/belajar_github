# belajar_github 🎮

Game **terminal** untuk belajar Git & GitHub sampai tuntas — dari perintah paling dasar
hingga paling rumit. Tampilannya seperti CMD / command prompt: kamu **mengetik** perintah git
untuk menyelesaikan misi.

🔗 Main online: `https://muzadidil.github.io/belajar_github` *(aktif setelah GitHub Pages dinyalakan)*

## Aturan main
- **5 fase**, tiap fase **50 soal**, urut dari mudah → sulit.
- Fase berikutnya **terkunci** sampai fase sebelumnya tuntas.
- **3 nyawa per fase**. Salah (termasuk **typo** — mode hardcore) = −1 nyawa.
- **Nyawa habis = ulang fase ini** dari soal 1 (nyawa kembali 3).
- **Dilarang paste** — wajib ketik manual untuk melatih *muscle memory*.
- Soal **1–10 tiap fase** diberi hint (tapi salah tetap mengurangi nyawa).

| Fase | Tema |
|---|---|
| 1 | Dasar lokal: `add`, `commit`, `status` |
| 2 | Branch: buat, pindah, gabung |
| 3 | Kolaborasi remote: `push`, `pull`, `fetch`, `clone` |
| 4 | SSH untuk Git/GitHub |
| 5 | Mahir: `rebase`, `reset`, `revert`, `cherry-pick`, `stash`, `tag` |

## Struktur
```
index.html        layar terminal
css/style.css     tampilan ala CMD
js/levels.js      data 250 soal
js/firebase.js    simpan progres (Firebase / localStorage)
js/terminal.js    cetak baris, input, anti-paste
js/game.js        logika nyawa, fase, skor, validasi
```

## Menjalankan secara lokal
Cukup buka `index.html` di browser. Tanpa konfigurasi Firebase, progres disimpan di
`localStorage` browser (offline). Setelah Firebase diisi, progres tersimpan online.

## Setup Firebase (opsional, untuk simpan progres online)
1. Buat project di <https://console.firebase.google.com>.
2. Aktifkan **Realtime Database** dan **Authentication → Anonymous**.
3. Salin **Firebase SDK config** (web app) ke `js/firebase.js` (ganti bagian `GANTI_...`).

## Deploy ke GitHub Pages
`Settings → Pages → Branch: main → /(root) → Save`. Tunggu 1–2 menit.
