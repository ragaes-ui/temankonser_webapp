import m from "mithril";
import { formatDriveLink } from "../models/ConcertState.js";

const PhotoGrid = {
  // State untuk menyimpan foto mana yang sedang di-klik/diperbesar
  selectedImage: null,

  view: (vnode) => {
    const images = vnode.attrs.images || [];

    return m("div", [
      // 1. Grid Foto Utama
      m("div", { class: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" },
        images.map(imgUrl =>
          m("div", { class: "bg-slate-800 aspect-square rounded-xl overflow-hidden shadow-sm group border border-white/5" },
            m("img", { 
              src: formatDriveLink(imgUrl), 
              alt: "Dokumentasi Konser",
              // Kursor berubah jadi kaca pembesar saat disorot
              class: "w-full h-full object-cover object-center cursor-zoom-in group-hover:scale-110 transition-transform duration-500",
              // Saat diklik, simpan URL gambar ke dalam state
              onclick: () => { vnode.state.selectedImage = formatDriveLink(imgUrl); },
              // Jika gambar gagal dimuat (link mati/akses dibatasi), tampilkan gambar cadangan
              onerror: (e) => { 
                e.target.src = "https://placehold.co/400x400/1e293b/94a3b8?text=Gagal+Dimuat";
                // Matikan efek klik dan hover jika gambar error
                e.target.onclick = null;
                e.target.classList.remove("cursor-zoom-in", "group-hover:scale-110");
              }
            })
          )
        )
      ),

      // 2. Lightbox / Modal Overlay (Hanya muncul jika ada foto yang diklik)
      vnode.state.selectedImage ? 
        m("div", { 
          // Latar belakang hitam transparan yang menutupi layar penuh
          class: "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300",
          // Tutup lightbox kalau sembarang area kosong diklik
          onclick: () => { vnode.state.selectedImage = null; }
        },
          
          // Gambar yang diperbesar
          m("img", {
            src: vnode.state.selectedImage,
            class: "max-h-[90vh] max-w-[95vw] md:max-w-[80vw] object-contain rounded-lg shadow-2xl transform scale-100 animate-[pulse_0.2s_ease-out_1]",
            // Hentikan penutupan lightbox jika yang diklik adalah fotonya itu sendiri
            onclick: (e) => { e.stopPropagation(); },
            onerror: (e) => { 
              e.target.src = "https://placehold.co/800x600/1e293b/94a3b8?text=Gagal+Dimuat"; 
            }
          }),

          // Tombol X (Close)
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