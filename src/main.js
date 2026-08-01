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
});