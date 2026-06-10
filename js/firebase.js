/*
 * firebase.js — Penyimpanan progres
 *
 * Game memakai Firebase Realtime Database + Anonymous Auth bila SUDAH dikonfigurasi.
 * Bila belum (config masih "GANTI_..."), otomatis pakai localStorage browser,
 * sehingga game tetap bisa dimainkan sebelum Firebase disiapkan.
 *
 * >>> LANGKAH KAMU: ganti nilai di bawah dengan config dari Firebase Console. <<<
 *     (Project Settings -> Your apps -> Web app -> Firebase SDK config)
 */
const firebaseConfig = {
  apiKey: "GANTI_APIKEY",
  authDomain: "GANTI.firebaseapp.com",
  databaseURL: "https://GANTI-default-rtdb.firebaseio.com",
  projectId: "GANTI",
  storageBucket: "GANTI.appspot.com",
  messagingSenderId: "GANTI",
  appId: "GANTI",
};

const Storage = {
  mode: "local", // "firebase" | "local"
  uid: null,
  _key: "belajar_github_progress",

  _isConfigured() {
    return (
      firebaseConfig.apiKey &&
      firebaseConfig.apiKey.indexOf("GANTI") === -1 &&
      firebaseConfig.databaseURL &&
      firebaseConfig.databaseURL.indexOf("GANTI") === -1
    );
  },

  async init() {
    if (this._isConfigured() && window.firebase) {
      try {
        firebase.initializeApp(firebaseConfig);
        const cred = await firebase.auth().signInAnonymously();
        this.uid = cred.user.uid;
        this.mode = "firebase";
        return this.mode;
      } catch (e) {
        console.warn("[belajar_github] Firebase gagal, fallback ke localStorage:", e);
      }
    }
    this.mode = "local";
    this.uid = "local";
    return this.mode;
  },

  async load() {
    try {
      if (this.mode === "firebase") {
        const snap = await firebase.database().ref("users/" + this.uid).once("value");
        return snap.val();
      }
      const raw = localStorage.getItem(this._key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("[belajar_github] load gagal:", e);
      return null;
    }
  },

  async save(state) {
    try {
      if (this.mode === "firebase") {
        await firebase.database().ref("users/" + this.uid).update(state);
        return;
      }
      localStorage.setItem(this._key, JSON.stringify(state));
    } catch (e) {
      console.warn("[belajar_github] save gagal:", e);
    }
  },
};

window.Storage = Storage;
