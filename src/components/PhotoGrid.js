import m from "mithril";
import { formatDriveLink } from "../models/ConcertState.js";

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
            class: "bg-slate-800 aspect-square rounded-xl overflow-hidden shadow-sm group border border-white/5 opacity-0 transform translate-y-12 transition-all duration-1000 ease-out relative",
            
            oncreate: (vnodeEl) => {
              const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                  setTimeout(() => {
                    vnodeEl.dom.classList.remove("opacity-0", "translate-y-12");
                    vnodeEl.dom.classList.add("opacity-100", "translate-y-0");
                  }, (index % 15) * 300); 
                  
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
              onclick: () => { vnode.state.selectedImage = directUrl; },
              onerror: (e) => { 
                e.target.src = "https://placehold.co/400x400/1e293b/94a3b8?text=Gagal+Dimuat";
                e.target.onclick = null;
                e.target.classList.remove("cursor-zoom-in", "group-hover:scale-110");
              }
            }),

            // 2. Tombol Download Melayang saat Hover (Di Pojok Kanan Bawah)
            m("div", { class: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3 pointer-events-none" },
              m("a", {
                href: directUrl,
                download: "temankonser-memori.jpg",
                target: "_blank",
                rel: "noopener noreferrer",
                onclick: (e) => { e.stopPropagation(); }, // Supaya tidak memicu fungsi klik zoom foto
                class: "pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              }, [
                m("span", {}, "📥"),
                m("span", {}, "Download")
              ])
            )
          );
        })
      ),

      // Modal / Lightbox (Dilengkapi tombol download juga di dalamnya)
      vnode.state.selectedImage ? 
        m("div", { 
          class: "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300",
          onclick: () => { vnode.state.selectedImage = null; }
        },
          m("div", { 
            class: "relative flex flex-col items-center",
            onclick: (e) => { e.stopPropagation(); } 
          },
            m("img", {
              src: vnode.state.selectedImage,
              class: "max-h-[80vh] max-w-[95vw] md:max-w-[80vw] object-contain rounded-lg shadow-2xl animate-[pulse_0.2s_ease-out_1]",
              onerror: (e) => { 
                e.target.src = "https://placehold.co/800x600/1e293b/94a3b8?text=Gagal+Dimuat"; 
              }
            }),
            // Tombol download tambahan di bawah gambar saat mode Zoom/Lightbox
            m("a", {
              href: vnode.state.selectedImage,
              download: "temankonser-memori.jpg",
              target: "_blank",
              rel: "noopener noreferrer",
              class: "mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
            }, [
              m("span", {}, "📥"),
              m("span", {}, "Download Foto Ini")
            ])
          ),

          m("button", {
            class: "absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition-all text-xl font-bold",
            onclick: () => { vnode.state.selectedImage = null; }
          }, "✕")
        )
      : null
    ]);
  }
};

export default PhotoGrid;