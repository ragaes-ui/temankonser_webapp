import m from "mithril";

// Deteksi otomatis: Kalau di localhost pakai port 3000, kalau di Vercel langsung /api
const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api";

export const formatDriveLink = (url) => {
  if (!url) return "";
  const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
  if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return url;
};

const ConcertState = {
  list: [], // Kosongkan, karena akan diisi dari database
  currentId: "home",
  
  // Fungsi baru untuk mengambil data dari Backend API
  loadConcerts: async () => {
    try {
      // Menarik data dari server Node.js
      const data = await m.request({
        method: "GET",
        url: `${API_URL}/concerts` // CUKUP 1 BARIS INI SAJA
      });
      ConcertState.list = data;
    } catch (error) {
      console.error("Gagal memuat data konser:", error);
    }
  },

  setConcert: (id) => {
    ConcertState.currentId = id;
  }
};

export default ConcertState;