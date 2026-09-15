import m from "mithril";
import { formatDriveLink } from "../models/ConcertState.js";

// --- KOMPONEN PORTAL SAKTI ---
// Ini berfungsi menarik pop-up foto keluar dari jebakan efek kaca (backdrop-blur)
const Portal = {
  oncreate: (vnode) => {
    vnode.state.container = document.createElement("div");
    document.body.appendChild(vnode.state.container);
    m.render(vnode.state.container, vnode.children);
    // Kunci scroll background biar layarnya nggak jalan-jalan saat lihat foto
    document.body.style.overflow = "hidden"; 
  },
  onupdate: (vnode) => {
    m.render(vnode.state.container, vnode.children);
  },
  onremove: (vnode) => {
    m.render(vnode.state.container, null);
    vnode.state.container.remove();
    // Buka kembali kunci scroll setelah pop-up ditutup
    document.body.style.overflow = ""; 
  },
  view: () => m("div", { style: { display: "none" } }) // Tempat bayangan
};
// --------------------------------

const PhotoGrid = {
  selectedImage: null,

  view: (vnode) => {
    const images = vnode.attrs.images || [];

    if (images.length === 0) {
      return m("p", { class: "text-center text-slate-500 italic py-8" }, "Belum ada arsip foto.");
    }

    return m("div", [
      m("div", { class: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" },
        images.map((imgUrl, index) => {
          const directUrl = formatDriveLink(imgUrl);

          return m("div", { 
            class: "bg-slate-800 aspect-square rounded-2xl overflow-hidden shadow-sm group border border-white/5 opacity-0 transform translate-y-12 transition-all duration-1000 ease-out relative",
            
            oncreate: (vnodeEl) => {
              const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                  setTimeout(() => {
                    vnodeEl.dom.classList.remove("opacity-0", "translate-y-12");
                    vnodeEl.dom.classList.add("opacity-100", "translate-y-0");
                  }, (index % 15) * 200); 
                  
                  observer.unobserve(vnodeEl.dom);
                }
              }, { threshold: 0.1 }); 

              observer.observe(vnodeEl.dom);
            }
          },
            // 1. Gambar Konser
            m("img", { 
              src: directUrl, 
              alt: "Dokumentasi Konser",
              class: "w-full h-full object-cover object-center cursor-zoom-in group-hover:scale-110 transition-transform duration-500",
              onclick: () => { vnode.state.selectedImage = directUrl; }
            }),

            // 2. Tombol Download Melayang saat Hover
            m("div", { class: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 pointer-events-none" },
              m("a", {
                href: directUrl,
                download: "temankonser-memori.jpg",
                target: "_blank",
                rel: "noopener noreferrer",
                onclick: (e) => { e.stopPropagation(); }, // Cegah klik foto
                class: "pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              }, [
                m("span", { class: "text-sm" }, "📥"),
                m("span", {}, "Download")
              ])
            )
          );
        })
      ),

      // --- MODAL / LIGHTBOX (SEKARANG DIBUNGKUS PORTAL) ---
      vnode.state.selectedImage ? 
        m(Portal, [
          m("div", { 
            // fixed inset-0 sekarang dijamin menutupi 100% layar HP/Laptop!
            class: "fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300",
            onclick: () => { 
              vnode.state.selectedImage = null; 
              m.redraw(); // Wajib dipanggil biar Mithril tau pop-up ditutup
            }
          },
            m("div", { 
              class: "relative flex flex-col items-center",
              onclick: (e) => { e.stopPropagation(); } 
            },
              m("img", {
                src: vnode.state.selectedImage,
                // Gambar dibatasi agar selalu pas di tengah, tidak kepotong
                class: "max-h-[80vh] max-w-[95vw] md:max-w-[85vw] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-[fadeIn_0.3s_ease-out_1]",
                onerror: (e) => { 
                  e.target.src = "https://placehold.co/800x600/1e293b/94a3b8?text=Gagal+Dimuat"; 
                }
              }),
              
              // Tombol download di mode pop-up (dipercantik dengan efek pendar neon)
              m("a", {
                href: vnode.state.selectedImage,
                download: "temankonser-memori.jpg",
                target: "_blank",
                rel: "noopener noreferrer",
                class: "mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold px-8 py-3 rounded-full shadow-[0_10px_20px_rgba(99,102,241,0.4)] flex items-center gap-2 transform transition-transform hover:-translate-y-1"
              }, [
                m("span", { class: "text-lg" }, "📥"),
                m("span", {}, "Download Foto Ini")
              ])
            ),

            // Tombol Close (Silang) di pojok kanan atas dengan efek muter
            m("button", {
              class: "absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition-all text-xl font-bold shadow-lg hover:rotate-90 duration-300",
              onclick: () => { 
                vnode.state.selectedImage = null; 
                m.redraw(); 
              }
            }, "✕")
          )
        ])
      : null
    ]);
  }
};

export default PhotoGrid;
