import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Settings from "../models/Settings.js"; 

// --- KOMPONEN BENDERA ---
const FlagID = () => m("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", class: "w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-slate-400/30 flex-shrink-0 shadow-sm" },
  m("rect", { width: "512", height: "256", fill: "#ce1126" }),
  m("rect", { y: "256", width: "512", height: "256", fill: "#f8f9fa" })
);

const FlagEN = () => m("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", class: "w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-slate-400/30 flex-shrink-0 shadow-sm" },
  m("rect", { width: "512", height: "512", fill: "#012169" }),
  m("path", { fill: "#fff", d: "M512 0v64L314 256l198 192v64h-64L256 314 58 512H0v-64l198-192L0 64V0h64l198 192L448 0h64z" }),
  m("path", { fill: "#c8102e", d: "M164 256L0 90v42l132 124zm184 0L512 90v42L380 256zM0 422v-42l132-124 32 30zm512 0v-42L380 256l-32 30z" }),
  m("path", { fill: "#fff", d: "M176 0v512h160V0zM0 176v160h512V176z" }),
  m("path", { fill: "#c8102e", d: "M216 0v512h80V0zM0 216v80h512v-80z" })
);

// --- FUNGSI MENCARI INISIAL NAMA EVENT ---
const getInitials = (name) => {
  if (!name) return "TK";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// --- FUNGSI MENGAMBIL THUMBNAIL FOTO EVENT ---
const getThumbnail = (concert) => {
  if (concert.poster) return concert.poster; 
  if (concert.gallery && concert.gallery.length > 0) {
    const url = concert.gallery[0];
    const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
    if (match && match[1]) return `https://drive.google.com/uc?id=${match[1]}`;
    return url;
  }
  
  // Jika tidak ada gambar, buat gambar dinamis pakai inisial nama event!
  const initials = getInitials(concert.shortTitle || concert.title);
  return `https://placehold.co/100x100/4f46e5/ffffff?text=${initials}`;
};

const Navbar = () => {
  let isMenuOpen = false;
  let isLangMenuOpen = false; 

  const setLanguage = (newLang) => {
    Settings.lang = newLang;
    localStorage.setItem("lang", newLang);
    isLangMenuOpen = false; 
    m.redraw();
  };

  return {
    view: () => {
      const currentId = m.route.param("id") || "home";
      const isDark = Settings.theme === "dark";
      
      const bgNav = isDark 
        ? "bg-slate-950/70 backdrop-blur-xl border-slate-800/50" 
        : "bg-white/70 backdrop-blur-xl border-gray-200 shadow-sm";
      const textNav = isDark ? "text-white" : "text-slate-900";
      
      const bgHover = isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-100";
      const bgActive = isDark ? "bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/20" : "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200";

      return m("nav", { class: `${bgNav} p-4 border-b sticky top-0 z-50 transition-all duration-500` },
        m("div", { class: "container mx-auto" },
          
          m("div", { class: "flex justify-between items-center" },
            
            // LOGO UTAMA NAVBAR
            m(m.route.Link, { href: "/home", class: "flex items-center gap-3 hover:opacity-80 transition-opacity" },
              m("img", { src: "/temankonserlogo.png", alt: "Logo Teman Konser", class: "w-8 h-8 md:w-10 md:h-10 object-contain rounded-full drop-shadow-md" }),
              m("div", { class: `font-bold text-lg md:text-xl tracking-wide ${textNav}` }, "TemanKonser")
            ),
            
            // KELOMPOK TOMBOL
            m("div", { class: "flex items-center gap-3 md:gap-4 relative" },
              
              // 1. TOMBOL TEMA
              m("button", {
                class: `flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                  isDark ? 'border-zinc-700 bg-zinc-800/40 hover:bg-zinc-700/80 text-amber-400' : 'border-gray-300 bg-white hover:bg-gray-100 text-amber-500'
                }`,
                onclick: (e) => { e.preventDefault(); Settings.toggleTheme(); },
                title: "Ganti Tema"
              }, 
                isDark 
                ? m("svg", { class: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, 
                    m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" })
                  )
                : m("svg", { class: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                    m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" })
                  )
              ),

              // 2. KELOMPOK BAHASA
              m("div", { class: "relative" }, [
                m("button", {
                  class: `flex items-center gap-2 pl-2 pr-3 py-1.5 md:py-2 rounded-full border transition-all duration-300 ${
                    isDark ? 'border-zinc-700 bg-zinc-800/40 hover:bg-zinc-700/80 text-white' : 'border-gray-300 bg-white hover:bg-gray-100 text-slate-800'
                  }`,
                  onclick: (e) => { e.preventDefault(); isLangMenuOpen = !isLangMenuOpen; }
                }, [
                  Settings.lang === "id" ? FlagID() : FlagEN(), 
                  m("span", { class: "font-bold text-sm" }, Settings.lang === "id" ? "ID" : "EN"),
                  m("svg", { class: `w-4 h-4 text-gray-400 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                    m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" })
                  )
                ]),

                isLangMenuOpen ? m("div", {
                  class: "fixed inset-0 z-40 cursor-default", 
                  onclick: (e) => { e.stopPropagation(); isLangMenuOpen = false; }
                }) : null,

                isLangMenuOpen ? m("div", {
                  class: `absolute top-full mt-3 right-0 w-44 rounded-2xl border shadow-xl overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out_1] ${
                    isDark ? 'bg-[#1E293B] border-slate-700 text-white shadow-black/50' : 'bg-white border-gray-200 text-slate-800 shadow-indigo-900/10'
                  }`
                }, [
                  m("button", {
                    class: `w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                    } ${Settings.lang === "id" ? (isDark ? 'bg-slate-800' : 'bg-indigo-50') : ''}`,
                    onclick: () => setLanguage("id")
                  }, [FlagID(), m("span", { class: "font-medium text-[15px]" }, "Indonesia")]),
                  m("button", {
                    class: `w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                    } ${Settings.lang === "en" ? (isDark ? 'bg-slate-800' : 'bg-indigo-50') : ''}`,
                    onclick: () => setLanguage("en")
                  }, [FlagEN(), m("span", { class: "font-medium text-[15px]" }, "English")])
                ]) : null
              ]),

              // 3. TOMBOL MENU EVENT
              m("button", {
                class: `flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                  isDark ? 'border-zinc-700 bg-zinc-800/40 hover:bg-zinc-700/80 text-white' : 'border-gray-300 bg-white hover:bg-gray-100 text-slate-800'
                }`,
                onclick: () => { isMenuOpen = !isMenuOpen; }
              }, 
                m("svg", { class: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                  isMenuOpen 
                  ? m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })
                  : m("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6h16M4 12h16m-7 6h7" }) 
                )
              )
            )
          ),

          // --- DROPDOWN MENU EVENT ---
          isMenuOpen ? 
            m("div", { class: `mt-4 flex flex-col gap-1.5 pb-2 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-200'} pt-4 max-h-[55vh] overflow-y-auto pr-1` },
              
              // 1. Menu Beranda Utama (Pakai Logo Teman Konser)
              m(m.route.Link, {
                href: "/home",
                class: `px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-3.5 ${currentId === "home" ? bgActive : bgHover} ${isDark ? 'text-slate-200' : 'text-slate-700'}`,
                onclick: () => { isMenuOpen = false; } 
              }, [
                m("img", { 
                  src: "/temankonserlogo.png", 
                  class: `w-9 h-9 rounded-lg object-contain flex-shrink-0 border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'} shadow-sm` 
                }),
                m("span", Settings.t("beranda") === "Beranda" ? "Beranda Utama" : "Main Home")
              ]), 

              m("div", { class: `h-px w-full my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}` }),

              // 2. Daftar Event Konser (Pakai Thumbnail Gambar / Inisial Otomatis)
              ConcertState.list.map(concert => {
                const titleText = concert.shortTitle || concert.title;
                return m(m.route.Link, {
                  href: `/${concert.id}`,
                  class: `px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-3.5 ${currentId === concert.id ? bgActive : bgHover} ${isDark ? 'text-slate-300' : 'text-slate-700'}`,
                  onclick: () => { isMenuOpen = false; }
                }, [
                  // Gambar thumbnail (atau inisial otomatis jika gambar patah/tidak ada)
                  m("img", {
                    src: getThumbnail(concert),
                    alt: titleText,
                    class: `w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`,
                    onerror: (e) => { 
                      const initials = getInitials(titleText);
                      e.target.src = `https://placehold.co/100x100/4f46e5/ffffff?text=${initials}`; 
                    } 
                  }),
                  m("span", { class: "truncate" }, titleText)
                ]);
              })
            )
          : null
        )
      );
    }
  };
};

export default Navbar;
