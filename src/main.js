import "./css/style.css";
import m from "mithril";
import ConcertLayout from "./views/ConcertLayout.js";
import AdminLayout from "./views/AdminLayout.js";

const appContainer = document.getElementById("app");

// Perbaikan Rute: Daftarkan /home secara spesifik supaya tidak direbut oleh /:id
m.route(appContainer, "/home", {
  "/home": ConcertLayout,
  "/admin/dashboard": AdminLayout,
  "/:id": ConcertLayout
}); // <--- m.route ditutup di sini

// --- LOGIKA UNTUK MENGHILANGKAN SPLASH SCREEN LOADING ---
window.addEventListener("load", () => {
  const loader = document.getElementById("global-loader");
  if (loader) {
    // Ubah opacity jadi 0 agar perlahan memudar (fade out)
    loader.style.opacity = "0";
    
    // Hapus elemen dari HTML setelah animasinya selesai (700ms)
    setTimeout(() => {
      loader.remove();
    }, 700);
  }
});