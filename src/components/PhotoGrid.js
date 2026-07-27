import m from "mithril";
import { formatDriveLink } from "../models/ConcertState.js";

const PhotoGrid = {
  selectedImage: null,

  view: (vnode) => {
    const images = vnode.attrs.images || [];

    return m("div", [
      m("div", { class: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" },
        images.map((imgUrl, index) =>
          m("div", { 
            // KODE DIUBAH: Menggunakan duration-1000 agar gerakan naiknya lebih lambat (1 detik)
            class: "bg-slate-800 aspect-square rounded-xl overflow-hidden shadow-sm group border border-white/5 opacity-0 transform translate-y-12 transition-all duration-1000 ease-out",
            
            oncreate: (vnode) => {
              const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                  // KODE DIUBAH: Jeda waktu diperbesar dari 150 menjadi 300
                  setTimeout(() => {
                    vnode.dom.classList.remove("opacity-0", "translate-y-12");
                    vnode.dom.classList.add("opacity-100", "translate-y-0");
                  }, (index % 15) * 300); 
                  
                  observer.unobserve(vnode.dom);
                }
              }, { threshold: 0.1 }); 

              observer.observe(vnode.dom);
            }
          },
            m("img", { 
              src: formatDriveLink(imgUrl), 
              alt: "Dokumentasi Konser",
              class: "w-full h-full object-cover object-center cursor-zoom-in group-hover:scale-110 transition-transform duration-500",
              onclick: () => { vnode.state.selectedImage = formatDriveLink(imgUrl); },
              onerror: (e) => { 
                e.target.src = "https://placehold.co/400x400/1e293b/94a3b8?text=Gagal+Dimuat";
                e.target.onclick = null;
                e.target.classList.remove("cursor-zoom-in", "group-hover:scale-110");
              }
            })
          )
        )
      ),

      // Modal / Lightbox (Tetap sama)
      vnode.state.selectedImage ? 
        m("div", { 
          class: "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300",
          onclick: () => { vnode.state.selectedImage = null; }
        },
          m("img", {
            src: vnode.state.selectedImage,
            class: "max-h-[90vh] max-w-[95vw] md:max-w-[80vw] object-contain rounded-lg shadow-2xl transform scale-100 animate-[pulse_0.2s_ease-out_1]",
            onclick: (e) => { e.stopPropagation(); },
            onerror: (e) => { 
              e.target.src = "https://placehold.co/800x600/1e293b/94a3b8?text=Gagal+Dimuat"; 
            }
          }),
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