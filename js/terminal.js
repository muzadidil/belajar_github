/*
 * terminal.js — Lapisan tampilan terminal (cetak baris, input, anti-paste)
 */
const Term = {
  screen: null,
  input: null,
  ps: null,
  _handler: null,

  init() {
    this.screen = document.getElementById("screen");
    this.input = document.getElementById("cmd");
    this.ps = document.getElementById("ps");

    // === Anti-paste: wajib ketik manual (muscle memory) ===
    const blockPaste = (e) => {
      e.preventDefault();
      this.print("⛔ Paste/menempel dilarang! Ketik manual ya.", "warn");
    };
    this.input.addEventListener("paste", blockPaste);
    this.input.addEventListener("drop", blockPaste);
    this.input.addEventListener("dragover", (e) => e.preventDefault());
    this.input.addEventListener("contextmenu", (e) => e.preventDefault());

    // Enter = kirim jawaban
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = this.input.value;
        this.input.value = "";
        if (this._handler) this._handler(v);
      }
    });

    // Selalu fokus ke input saat mengetik di mana saja
    document.addEventListener("keydown", () => {
      if (document.activeElement !== this.input) this.input.focus();
    });
    const inputline = document.getElementById("inputline");
    if (inputline) inputline.addEventListener("click", () => this.input.focus());

    this.input.focus();
  },

  onSubmit(fn) {
    this._handler = fn;
  },

  print(text, cls) {
    const div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    div.textContent = text;
    this.screen.appendChild(div);
    this.scroll();
  },

  echoCommand(cmd) {
    const div = document.createElement("div");
    div.className = "line echo";
    div.textContent = (this.ps ? this.ps.textContent : "$") + " " + cmd;
    this.screen.appendChild(div);
    this.scroll();
  },

  clear() {
    this.screen.innerHTML = "";
  },

  shake() {
    const t = document.getElementById("terminal");
    if (!t) return;
    t.classList.remove("shake");
    void t.offsetWidth; // reflow agar animasi bisa diulang
    t.classList.add("shake");
  },

  scroll() {
    this.screen.scrollTop = this.screen.scrollHeight;
  },
};

window.Term = Term;
