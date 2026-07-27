import "./css/style.css";
import m from "mithril";
import ConcertLayout from "./views/ConcertLayout.js";

const appContainer = document.getElementById("app");

// Menggunakan m.route untuk sistem pindah laman yang sesungguhnya
m.route(appContainer, "/home", {
  "/:id": ConcertLayout
});