import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Settings from "../models/Settings.js"; 

const Navbar = () => {
  let isMenuOpen = false;

  return {
    view: () => {
      const currentId = m.route.param("id");
      const isDark = Settings.theme === "dark";
      
      // Efek kaca untuk background utama Navbar
      const bgNav = isDark 
        ? "bg-slate-950/70 backdrop-blur-xl border-slate-800/50" 
        : "bg-white/70 backdrop-blur-xl border-gray-200 shadow-sm";
      const textNav = isDark ? "text-white" : "text-slate-900";
      const bgHover = isDark ? "hover:bg-slate-800/50" : "hover:bg-gray-100/50";
      const bgActive = isDark ? "bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 font-bold";

      // --- KREASI LIQUID GLASS UNTUK SEMUA TOMBOL ---
      const glassBtnClass = isDark
        ? "bg-slate-800/40 backdrop-blur-lg border border-slate-600/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:bg-slate-700/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 text-slate-200 transition-all duration-300 ease-out"
        : "bg-white/50 backdrop-blur-lg border border-white/80 shadow-[0_4px_16px_rgba(99,102,241,0.15)] hover:bg-white/90 hover:border-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 text-slate-700 transition-all duration-300 ease-out";

      return m("nav", { class: `${bgNav} p-4 border-b sticky top-0 z-50 transition-all duration-500` },
        m("div", { class: "container mx-auto" },
          
          m("div", { class: "flex justify-between items-center" },
            
            // LOGO
            m(m.route.Link, { href: "/home", class: "flex items-center gap-3 hover:opacity-80 transition-opacity" },
              m("img", { src: "/temankonserlogo.png", alt: "Logo Teman Konser", class: "w-8 h-8 md:w-10 md:h-10 object-contain rounded-full drop-shadow-md" }),
              m("div", { class: `font-bold text-lg md:text-xl tracking-wide ${textNav}` }, "TemanKonser")
            ),
            
            // KELOMPOK TOMBOL (Sekarang semua pakai class Liquid Glass)
            m("div", { class: "flex items-center gap-2 md:gap-3" },
              
              // TOMBOL BAHASA (ID / EN) - Bentuk Pil Bulat
              m("button", {
                class: `px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-extrabold rounded-full ${glassBtnClass} flex items-center justify-center`,
                onclick: (e) => { e.preventDefault(); Settings.toggleLang(); }
              }, Settings.lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"),

              // TOMBOL TEMA (GELAP / TERANG) - Bentuk Bulat Sempurna
              m("button", {
                class: `p-2 md:p-2.5 rounded-full ${glassBtnClass} flex items-center justify-center w-9 h-9 md:w-11 md:h-11`,
                onclick: (e) => { e.preventDefault(); Settings.toggleTheme(); },
                title: "Ganti Tema"
              }, isDark ? m("span", { class: "text-lg md:text-xl block" }, "☀️") : m("span", { class: "text-lg md:text-xl block" }, "🌙")),

              // TOMBOL TITIK TIGA - Bentuk Bulat Sempurna
              m("button", {
                class: `p-2 md:p-2.5 rounded-full ${glassBtnClass} flex items-center justify-center w-9 h-9 md:w-11 md:h-11`,
                onclick: () => { isMenuOpen = !isMenuOpen; }
              }, 
                m("svg", { class: "w-5 h-5 md:w-6 md:h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                  isMenuOpen 
                  ? m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M6 18L18 6M6 6l12 12" })
                  : m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" })
                )
              )
            )
          ),

          // DROPDOWN MENU
          isMenuOpen ? 
            m("div", { class: `mt-4 flex flex-col gap-2 pb-2 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-200'} pt-4` },
              m(m.route.Link, {
                href: "/home",
                // Menu dropdown juga disesuaikan biar ujungnya lebih melengkung (rounded-2xl)
                class: `px-4 py-3 rounded-2xl text-base font-medium transition text-center ${currentId === "home" ? bgActive : bgHover} ${isDark ? 'text-slate-300' : 'text-slate-800'}`,
                onclick: () => { isMenuOpen = false; } 
              }, Settings.t("beranda")), 

              ConcertState.list.map(concert =>
                m(m.route.Link, {
                  href: `/${concert.id}`,
                  class: `px-4 py-3 rounded-2xl text-base font-medium transition text-center ${currentId === concert.id ? bgActive : bgHover} ${isDark ? 'text-slate-300' : 'text-slate-800'}`,
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
