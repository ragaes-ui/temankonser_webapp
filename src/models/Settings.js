import m from "mithril";

const Settings = {
  // Ambil memori dari browser, default ID dan Gelap
  lang: localStorage.getItem("lang") || "id",
  theme: localStorage.getItem("theme") || "dark",

  // 1. Fungsi Mengubah Bahasa Secara Global
  toggleLang: () => {
    Settings.lang = Settings.lang === "id" ? "en" : "id";
    localStorage.setItem("lang", Settings.lang);
    m.redraw(); // Paksa seluruh web merender ulang dengan bahasa baru!
  },

  // 2. Fungsi Mengubah Tema Secara Global
  toggleTheme: () => {
    Settings.theme = Settings.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", Settings.theme);
    m.redraw(); // Paksa seluruh web merender ulang dengan warna baru!
  },

  // 3. KAMUS BAHASA (Tambahkan semua kata-kata yang ada di web mas ke sini)
  kamus: {
    id: {
      beranda: "Beranda",
      arsip_kosong: "Belum ada arsip foto.",
      download: "Download Foto Ini",
      login: "Masuk",
      batal: "Batal"
    },
    en: {
      beranda: "Home",
      arsip_kosong: "No photo archives yet.",
      download: "Download This Photo",
      login: "Login",
      batal: "Cancel"
    }
  },

  // Fungsi Penerjemah (Tinggal panggil Settings.t("kata_kunci"))
  t: (kunci) => {
    return Settings.kamus[Settings.lang][kunci] || kunci;
  }
};

export default Settings;
