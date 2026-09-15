import m from "mithril";
import ConcertState from "../models/ConcertState.js";

// 1. Simpan pengaturan user di memori browser (Local Storage)
// Jadi pas di-refresh, pilihan mode gelap dan bahasanya nggak kereset
let isDarkMode = localStorage.getItem("theme") !== "light"; // Default: Gelap
let lang = localStorage.getItem("lang") || "id"; // Default: Indonesia
let isMenuOpen = false;

// 2. Kamus Bahasa Sederhana
const text = {
  id: { beranda: "Beranda" },
  en: { beranda: "Home" }
};

const Navbar = () => {
  return {
    view: () => {
      const currentId = m.route.param("id");

      // 3. Kumpulan Warna Dinamis (Terang vs Gelap)
      const bgNav = isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm";
      const textNav = isDarkMode ? "text-white" : "text-slate-900";
      const textMuted = isDarkMode ? "text-slate-300" : "text-slate-600";
      const bgHover = isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-100";
      const bgActive = isDarkMode ? "bg-slate-800 text-white" : "bg-indigo-50 text-indigo-700 font-bold";

      return m("nav", { class: `${bgNav} ${textMuted} p-4 border-b sticky top-0 z-50 transition-colors duration-300` },
        m("div", { class: "container mx-auto" },
          
          // --- BARIS UTAMA NAVBAR ---
          m("div", { class: "flex justify-between items-center" },
            
            // LOGO & NAMA WEB
            m(m.route.Link, { href: "/home", class: "flex items-center gap-3 hover:opacity-80 transition-opacity" },
              m("img", { 
                src: "/temankonserlogo.png", 
                alt: "Logo Teman Konser", 
                class: "w-8 h-8 md:w-10 md:h-10 object-contain rounded-full" 
              }),
              m("div", { class: `font-bold text-lg md:text-xl tracking-wide ${textNav}` }, "TemanKonser")
            ),
            
            // --- KELOMPOK TOMBOL (TEMA, BAHASA, & MENU TITIK TIGA) ---
            m("div", { class: "flex items-center gap-3 md:gap-4" },
              
              // TOMBOL BAHASA (ID / EN)
              m("button", {
                class: `px-2 py-1 md:px-3 text-xs font-bold rounded-md border transition-colors ${
                  isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                }`,
                onclick: () => {
                  lang = lang === "id" ? "en" : "id";
                  localStorage.setItem("lang", lang);
                }
              }, lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"),

              // TOMBOL TEMA (GELAP / TERANG)
              m("button", {
                class: `p-1.5 md:p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-700'
                }`,
                onclick: () => {
                  isDarkMode = !isDarkMode;
                  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
                },
                title: "Ganti Tema"
              }, 
                // Ikon Matahari untuk Terang, Bulan untuk Gelap
                isDarkMode 
                ? m("span", { class: "text-lg md:text-xl block" }, "☀️") 
                : m("span", { class: "text-lg md:text-xl block" }, "🌙")
              ),

              // TOMBOL TITIK TIGA (Menu Event)
              m("button", {
                class: `focus:outline-none p-1 transition-transform duration-200 ${textNav}`,
                onclick: () => { isMenuOpen = !isMenuOpen; }
              }, 
                m("svg", { class: "w-7 h-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                  isMenuOpen 
                  ? m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
                  : m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" })
                )
              )
            )
          ),

          // --- DROPDOWN MENU ---
          isMenuOpen ? 
            m("div", { class: `mt-4 flex flex-col gap-2 pb-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pt-4 animate-[fadeIn_0.3s_ease-out_1]` },
              
              // Menu Beranda (Teksnya dinamis pakai Kamus)
              m(m.route.Link, {
                href: "/home",
                class: `px-4 py-3 rounded-md text-base font-medium transition text-center ${
                  currentId === "home" ? bgActive : bgHover
                }`,
                onclick: () => { isMenuOpen = false; } 
              }, text[lang].beranda),

              // Menu Event
              ConcertState.list.map(concert =>
                m(m.route.Link, {
                  href: `/${concert.id}`,
                  class: `px-4 py-3 rounded-md text-base font-medium transition text-center ${
                    currentId === concert.id ? bgActive : bgHover
                  }`,
                  onclick: () => { isMenuOpen = false; }
                }, concert.shortTitle || concert.title)
              )
            )
          : null
        )
      );
    }
  };
};

export default Navbar;
