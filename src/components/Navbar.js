import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Settings from "../models/Settings.js"; 

const Navbar = () => {
  let isMenuOpen = false;

  return {
    view: () => {
      const currentId = m.route.param("id");
      const isDark = Settings.theme === "dark";
      
      // WARNA MURNI HITAM (Bukan biru/slate lagi)
      const bgNav = isDark ? "bg-black border-zinc-900" : "bg-white border-gray-200 shadow-sm";
      const textNav = isDark ? "text-white" : "text-black";
      const bgHover = isDark ? "hover:bg-zinc-900" : "hover:bg-gray-100";
      const bgActive = isDark ? "bg-zinc-800 text-white" : "bg-indigo-50 text-indigo-700 font-bold";

      return m("nav", { class: `${bgNav} p-4 border-b sticky top-0 z-50 transition-colors duration-300` },
        m("div", { class: "container mx-auto" },
          
          m("div", { class: "flex justify-between items-center" },
            
            // LOGO
            m(m.route.Link, { href: "/home", class: "flex items-center gap-3 hover:opacity-80 transition-opacity" },
              m("img", { src: "/temankonserlogo.png", alt: "Logo Teman Konser", class: "w-8 h-8 md:w-10 md:h-10 object-contain rounded-full" }),
              m("div", { class: `font-bold text-lg md:text-xl tracking-wide ${textNav}` }, "TemanKonser")
            ),
            
            // KELOMPOK TOMBOL
            m("div", { class: "flex items-center gap-3 md:gap-4" },
              
              m("button", {
                class: `px-2 py-1 md:px-3 text-xs font-bold rounded-md border transition-colors ${
                  isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                }`,
                onclick: (e) => { e.preventDefault(); Settings.toggleLang(); }
              }, Settings.lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"),

              m("button", {
                class: `p-1.5 md:p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-amber-400' : 'hover:bg-gray-100 text-gray-700'
                }`,
                onclick: (e) => { e.preventDefault(); Settings.toggleTheme(); },
                title: "Ganti Tema"
              }, isDark ? m("span", { class: "text-lg block" }, "☀️") : m("span", { class: "text-lg block" }, "🌙")),

              m("button", {
                class: `focus:outline-none p-1 transition-transform ${isDark ? 'text-zinc-300' : 'text-gray-700'} hover:text-indigo-500`,
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

          isMenuOpen ? 
            m("div", { class: `mt-4 flex flex-col gap-2 pb-2 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'} pt-4` },
              m(m.route.Link, {
                href: "/home",
                class: `px-4 py-3 rounded-md text-base font-medium transition text-center ${currentId === "home" ? bgActive : bgHover} ${isDark ? 'text-zinc-300' : 'text-gray-800'}`,
                onclick: () => { isMenuOpen = false; } 
              }, Settings.t("beranda")), 

              ConcertState.list.map(concert =>
                m(m.route.Link, {
                  href: `/${concert.id}`,
                  class: `px-4 py-3 rounded-md text-base font-medium transition text-center ${currentId === concert.id ? bgActive : bgHover} ${isDark ? 'text-zinc-300' : 'text-gray-800'}`,
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
