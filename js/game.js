/*
 * game.js — Mesin permainan
 *
 * Aturan:
 *  - 5 fase, tiap fase 50 soal (sekarang masih data contoh).
 *  - Fase berikutnya terkunci sampai fase sebelumnya tuntas.
 *  - 3 nyawa per fase. Salah (termasuk typo, mode hardcore) = -1 nyawa.
 *  - Nyawa habis = ulang FASE INI dari soal 1, nyawa kembali 3.
 *  - Soal 1..10 tiap fase diberi hint, tapi salah tetap mengurangi nyawa.
 */

const FASE_NAMA = ["DASAR LOKAL", "BRANCH", "KOLABORASI REMOTE", "SSH", "MAHIR"];

// Normalisasi jawaban: rapikan spasi & samakan tanda kutip.
// Case TETAP diperhatikan (nama branch & pesan commit sensitif huruf).
function norm(s) {
  return (s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[`'"]/g, '"');
}

const Game = {
  state: {
    faseIndex: 0, // fase yang sedang dimainkan (0..4)
    soalIndex: 0, // soal dalam fase (0..n-1)
    nyawa: 3,
    skor: 0,
    faseSkor: 0, // poin yang terkumpul pada percobaan fase ini (dibatalkan bila game over)
    unlocked: 0, // fase tertinggi yang sudah terbuka
  },

  async start() {
    Term.init();
    Term.onSubmit((v) => this.handle(v));
    this.boot();

    const mode = await Storage.init();
    this.setMode(mode);

    const saved = await Storage.load();
    if (saved && typeof saved.faseIndex === "number") {
      this.state = Object.assign(this.state, saved);
      // jaga-jaga bila data soal berubah jumlahnya
      if (this.state.faseIndex >= FASE.length) this.state.faseIndex = FASE.length - 1;
      if (this.state.soalIndex >= FASE[this.state.faseIndex].soal.length) this.state.soalIndex = 0;
      if (!this.state.nyawa || this.state.nyawa < 1) this.state.nyawa = 3;
    }

    Term.print(
      "Penyimpanan: " +
        (mode === "firebase"
          ? "Firebase (online) ✓"
          : "localStorage (offline) — atur Firebase nanti"),
      mode === "firebase" ? "ok" : "info"
    );
    Term.print("", "");
    this.showSoal();
  },

  boot() {
    Term.print("==================================================", "info");
    Term.print("   belajar_github :: GAME TERMINAL GIT", "misi");
    Term.print("   5 fase • 50 soal/fase • 3 nyawa/fase • hardcore", "info");
    Term.print("   Ketik perintah git untuk menjawab. DILARANG paste.", "info");
    Term.print("   Bantuan: :help    Bersihkan layar: :clear", "info");
    Term.print("==================================================", "info");
    Term.print("", "");
  },

  setMode(mode) {
    const el = document.getElementById("st-mode");
    if (!el) return;
    el.textContent = mode === "firebase" ? "● online" : "● offline";
    el.style.color = mode === "firebase" ? "#4ee44e" : "#f0c674";
  },

  curFase() {
    return FASE[this.state.faseIndex];
  },
  curSoal() {
    return this.curFase().soal[this.state.soalIndex];
  },

  updateStatus() {
    const s = this.state;
    const total = this.curFase().soal.length;
    const set = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    set("st-fase", "FASE " + (s.faseIndex + 1) + " " + FASE_NAMA[s.faseIndex]);
    set("st-soal", "SOAL " + (s.soalIndex + 1) + "/" + total);
    set("st-nyawa", "❤".repeat(s.nyawa) + "·".repeat(Math.max(0, 3 - s.nyawa)));
    set("st-skor", "SKOR " + s.skor);
  },

  showSoal() {
    this.updateStatus();
    const soal = this.curSoal();
    const s = this.state;
    Term.print(
      "─ FASE " +
        (s.faseIndex + 1) +
        " • SOAL " +
        (s.soalIndex + 1) +
        "/" +
        this.curFase().soal.length +
        " • " +
        "❤".repeat(s.nyawa) +
        " • skor " +
        s.skor +
        " ─",
      "info"
    );
    Term.print("MISI: " + soal.prompt, "misi");
    if (soal.hint && soal.hint.length) {
      Term.print("💡 HINT: " + soal.hint, "hint");
    }
  },

  async handle(input) {
    const raw = input;
    const trimmed = raw.trim();
    if (trimmed === "") return;

    // perintah meta (diawali ':') — tidak dihitung jawaban
    if (trimmed === ":help") return this.help();
    if (trimmed === ":clear") {
      Term.clear();
      return this.showSoal();
    }

    Term.echoCommand(raw);
    const soal = this.curSoal();
    const benar =
      norm(raw) === norm(soal.jawaban) ||
      (soal.alt || []).some((a) => norm(raw) === norm(a));

    if (benar) {
      this.state.skor += soal.poin;
      this.state.faseSkor += soal.poin;
      Term.print("✓ BENAR! +" + soal.poin + " poin.", "ok");
      await this.save();
      this.next();
    } else {
      this.state.nyawa -= 1;
      Term.shake();
      Term.print(
        "✗ SALAH! -1 nyawa. Sisa: " + "❤".repeat(Math.max(0, this.state.nyawa)),
        "err"
      );
      await this.save();
      if (this.state.nyawa <= 0) {
        this.gameOver();
      } else {
        Term.print("Coba lagi soal yang sama.", "warn");
        this.updateStatus();
      }
    }
  },

  next() {
    this.state.soalIndex += 1;
    if (this.state.soalIndex >= this.curFase().soal.length) {
      this.faseLulus();
    } else {
      Term.print("", "");
      this.showSoal();
    }
  },

  async faseLulus() {
    const idx = this.state.faseIndex;
    this.state.unlocked = Math.max(this.state.unlocked, idx + 1);
    this.state.faseSkor = 0;

    Term.print("", "");
    Term.print("★★★ FASE " + (idx + 1) + " LULUS! ★★★", "ok");

    if (idx >= FASE.length - 1) {
      Term.print("", "");
      Term.print("🏆 SELAMAT! Semua fase tamat. Skor akhir: " + this.state.skor, "ok");
      Term.print("Kamu sekarang jago Git & GitHub! :clear untuk layar bersih.", "info");
      await this.save();
      return;
    }

    this.state.faseIndex = idx + 1;
    this.state.soalIndex = 0;
    this.state.nyawa = 3;
    await this.save();

    Term.print(
      "Membuka FASE " + (this.state.faseIndex + 1) + " — " + FASE_NAMA[this.state.faseIndex] + "...",
      "info"
    );
    Term.print("", "");
    this.showSoal();
  },

  async gameOver() {
    Term.print("", "");
    Term.print("💀 GAME OVER — nyawa habis di FASE " + (this.state.faseIndex + 1) + ".", "err");
    Term.print("Mengulang FASE " + (this.state.faseIndex + 1) + " dari soal 1. Nyawa dipulihkan.", "warn");

    // batalkan poin yang diperoleh pada percobaan fase yang gagal
    this.state.skor -= this.state.faseSkor;
    if (this.state.skor < 0) this.state.skor = 0;
    this.state.faseSkor = 0;
    this.state.soalIndex = 0;
    this.state.nyawa = 3;
    await this.save();

    Term.print("", "");
    this.showSoal();
  },

  help() {
    Term.print("— BANTUAN —", "info");
    Term.print("• Ketik perintah git untuk menjawab MISI lalu tekan Enter.", "info");
    Term.print("• DILARANG menempel (paste). Ketik manual untuk muscle memory.", "info");
    Term.print("• 3 nyawa per fase. Salah (termasuk typo) = -1 nyawa.", "info");
    Term.print("• Nyawa habis = ulang fase ini dari soal 1.", "info");
    Term.print("• :clear untuk membersihkan layar.", "info");
  },

  async save() {
    const s = this.state;
    await Storage.save({
      faseIndex: s.faseIndex,
      soalIndex: s.soalIndex,
      nyawa: s.nyawa,
      skor: s.skor,
      faseSkor: s.faseSkor,
      unlocked: s.unlocked,
    });
  },
};

if (document.readyState !== "loading") {
  Game.start();
} else {
  window.addEventListener("DOMContentLoaded", () => Game.start());
}
