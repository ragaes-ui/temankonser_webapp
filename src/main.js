import "./css/style.css";
import m from "mithril";
import ConcertLayout from "./views/ConcertLayout.js";
import AdminLayout from "./views/AdminLayout.js";

const appContainer = document.getElementById("app");

m.route(appContainer, "/home", {
  "/home": ConcertLayout,
  "/admin/dashboard": AdminLayout,
  "/:id": ConcertLayout
});