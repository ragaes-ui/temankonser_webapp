import m from "mithril";

// Penyesuaian URL API agar otomatis jalan di Lokal (localhost) maupun di Vercel
const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api";

export const formatDriveLink = (url) => {
  if (!url) return "";
  const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
  if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return url;
};

const ConcertState = {
  list: [], // <-- PENTING: Nilai awal WAJIB array kosong
  currentId: "home",
  
  loadConcerts: async () => {
    try {
      const data = await m.request({
        method: "GET",
        url: `${API_URL}/concerts`
      });
      
      // PENGAMAN MUTLAK VERCEL: Pastikan hasil dari database selalu berupa Array
      ConcertState.list = Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error("Gagal memuat data konser dari server:", error);
      // Jika server Vercel timeout/gagal, paksa jadi array kosong agar web tetap hidup
      ConcertState.list = []; 
    }
  },

  setConcert: (id) => {
    ConcertState.currentId = id;
  }
};

export default ConcertState;