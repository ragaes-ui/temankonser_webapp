import "./css/style.css";
import m from "mithril";
import ConcertLayout from "./views/ConcertLayout.js";
import AdminLayout from "./views/AdminLayout.js";

const appContainer = document.getElementById("app");

// Menggunakan m.route untuk sistem pindah laman yang sesungguhnya
m.route(appContainer, "/home", {
  // RUTE ADMIN (Wajib di urutan paling atas)
  "/admin/dashboard": AdminLayout,
  "/:id": ConcertLayout
});