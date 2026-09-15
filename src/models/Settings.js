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

// 3. KAMUS BAHASA
  kamus: {
    id: {
      beranda: "Beranda",
      judul_memori: "Memori",
      sambutan: "Selamat datang di ruang arsip digital kita. Web ini dibuat khusus untuk mengabadikan setiap momen dan euforia yang kita rasakan bersama di area moshpit maupun tribun.",
      petunjuk: "Silakan klik menu di atas untuk berpindah ke laman dokumentasi.",
      highlight: "Highlight Perjalanan"
    },
    en: {
      beranda: "Home",
      judul_memori: "Memories",
      sambutan: "Welcome to our digital archive room. This website was created specifically to capture every moment and euphoria we experienced together in the moshpit and the grandstands.",
      petunjuk: "Please click the menu above to navigate to the documentation pages.",
      highlight: "Journey Highlights"
    }
  },

  // Fungsi Penerjemah (Tinggal panggil Settings.t("kata_kunci"))
  t: (kunci) => {
    return Settings.kamus[Settings.lang][kunci] || kunci;
  }
};

export default Settings;
