import m from "mithril";
import ConcertState from "../models/ConcertState.js";

const Navbar = () => {
  let isMobileMenuOpen = false;

  return {
    view: () => {
      const currentId = m.route.param("id");

      return m("nav", { class: "bg-slate-950 text-slate-300 p-4 border-b border-slate-800 sticky top-0 z-50" },
        m("div", { class: "container mx-auto" },
          
          // --- BARIS UTAMA NAVBAR ---
          m("div", { class: "flex justify-between items-center" },
            
            // KODE BARU: Membungkus Logo dan Teks agar bersebelahan
            m(m.route.Link, { href: "/home", class: "flex items-center gap-3 hover:opacity-80 transition-opacity" },
              // Menampilkan Logo dari folder public
              m("img", { 
                src: "/temankonserlogo.png", 
                alt: "Logo Teman Konser", 
                class: "w-8 h-8 md:w-10 md:h-10 object-contain rounded-full" // Ukuran bisa disesuaikan
              }),
              m("div", { class: "font-bold text-lg md:text-xl tracking-wide text-white" }, "TemanKonser")
            ),
            
            // TOMBOL HAMBURGER
            m("button", {
              class: "md:hidden text-slate-300 hover:text-white focus:outline-none p-2",
              onclick: () => { isMobileMenuOpen = !isMobileMenuOpen; }
            }, 
              m("svg", { class: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                isMobileMenuOpen 
                ? m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
                : m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" })
              )
            ),

            // MENU DESKTOP
            m("div", { class: "hidden md:flex gap-2" },
              m(m.route.Link, {
                href: "/home",
                class: `px-4 py-2 rounded-md text-sm font-medium transition ${
                  currentId === "home" ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'
                }`
              }, "Beranda"),

              ConcertState.list.map(concert =>
                m(m.route.Link, {
                  href: `/${concert.id}`,
                  class: `px-4 py-2 rounded-md text-sm font-medium transition ${
                    currentId === concert.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'
                  }`
                }, concert.shortTitle || concert.title)
              )
            )
          ),

          // --- DROPDOWN MENU MOBILE ---
          isMobileMenuOpen ? 
            m("div", { class: "md:hidden mt-4 flex flex-col gap-2 pb-2 border-t border-slate-800 pt-4 animate-[fadeIn_0.3s_ease-out_1]" },
              m(m.route.Link, {
                href: "/home",
                class: `px-4 py-3 rounded-md text-base font-medium transition text-center ${
                  currentId === "home" ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'
                }`,
                onclick: () => { isMobileMenuOpen = false; } 
              }, "Beranda"),

              ConcertState.list.map(concert =>
                m(m.route.Link, {
                  href: `/${concert.id}`,
                  class: `px-4 py-3 rounded-md text-base font-medium transition text-center ${
                    currentId === concert.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'
                  }`,
                  onclick: () => { isMobileMenuOpen = false; }
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