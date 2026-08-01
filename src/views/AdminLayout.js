import m from "mithril";

// Deteksi otomatis: Kalau di localhost pakai port 3000, kalau di Vercel langsung /api
const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api";

const AdminLayout = {
  isLoggedIn: false,
  loginData: { username: "", password: "" },
  loginError: "",
  isLoading: false,

  // State untuk Data Event
  concertList: [], // Menyimpan riwayat event
  isEditing: false, // Penanda apakah sedang nambah baru atau edit
  
  formData: { id: "", shortTitle: "", title: "", desc: "", galleryInput: "", videosInput: "" },
  statusMsg: "",

oninit: async () => {
    // --- TAMBAHKAN SAKELAR PEMUTUS LOADING DI SINI ---
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.remove();
      }, 700);
    }
    // ------------------------------------------------

    if (localStorage.getItem("adminToken")) {
      AdminLayout.isLoggedIn = true;
      await AdminLayout.fetchHistory(); // Tarik riwayat jika sudah login
    }
  },

fetchHistory: async () => {
    try {
      const data = await m.request({
        method: "GET",
        // TAMBAHKAN ?t=${Date.now()} DI UJUNG URL
        url: `${API_URL}/concerts?t=${Date.now()}`, 
      });
      AdminLayout.concertList = data;
    } catch (error) {
      console.error("Gagal menarik riwayat", error);
    }
  },

  handleLogin: async (e) => {
    e.preventDefault();
    AdminLayout.isLoading = true;
    AdminLayout.loginError = "";

    try {
      const res = await m.request({
        method: "POST",
        url: `${API_URL}/login`, // KODE DIPERBAIKI
        body: AdminLayout.loginData
      });

      if (res.success) {
        AdminLayout.isLoggedIn = true;
        localStorage.setItem("adminToken", res.token);
        await AdminLayout.fetchHistory(); // Tarik riwayat saat sukses login
      }
    } catch (error) {
      AdminLayout.loginError = "Akses Ditolak! Username atau Password salah.";
    } finally {
      AdminLayout.isLoading = false;
    }
  },

  handleLogout: () => {
    localStorage.removeItem("adminToken");
    AdminLayout.isLoggedIn = false;
    AdminLayout.loginData = { username: "", password: "" };
  },

  // Fungsi untuk memasukkan data dari tabel ke dalam form (Mode Edit)
  editEvent: (concert) => {
    AdminLayout.isEditing = true;
    AdminLayout.formData = {
      id: concert.id,
      shortTitle: concert.shortTitle,
      title: concert.title,
      desc: concert.desc,
      // Gabungkan array menjadi teks per baris lagi untuk di dalam textarea
      galleryInput: concert.gallery ? concert.gallery.join("\n") : "",
      videosInput: concert.videos ? concert.videos.join("\n") : ""
    };
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll otomatis ke atas
  },

  // Fungsi untuk membatalkan mode Edit
  cancelEdit: () => {
    AdminLayout.isEditing = false;
    AdminLayout.formData = { id: "", shortTitle: "", title: "", desc: "", galleryInput: "", videosInput: "" };
  },

  // Fungsi Hapus Event
  deleteEvent: async (id) => {
    if (confirm(`Yakin ingin menghapus event dengan ID: ${id}?\nSemua arsip di dalamnya akan hilang dari web.`)) {
      try {
        await m.request({
          method: "DELETE",
          url: `${API_URL}/concerts/${id}` // KODE DIPERBAIKI
        });
        await AdminLayout.fetchHistory(); // Refresh tabel
      } catch (error) {
        alert("Gagal menghapus event");
      }
    }
  },

  submitData: async (e) => {
    e.preventDefault();
    AdminLayout.statusMsg = "Sedang menyimpan data...";

    const payload = {
      id: AdminLayout.formData.id,
      shortTitle: AdminLayout.formData.shortTitle,
      title: AdminLayout.formData.title,
      desc: AdminLayout.formData.desc,
      gallery: AdminLayout.formData.galleryInput.split("\n").map(url => url.trim()).filter(url => url),
      videos: AdminLayout.formData.videosInput.split("\n").map(url => url.trim()).filter(url => url)
    };

    try {
      // Jika mode Edit, gunakan PUT. Jika mode Tambah, gunakan POST.
      await m.request({
        method: AdminLayout.isEditing ? "PUT" : "POST",
        url: AdminLayout.isEditing 
          ? `${API_URL}/concerts/${payload.id}`  // KODE DIPERBAIKI
          : `${API_URL}/concerts`,               // KODE DIPERBAIKI
        body: payload
      });

      AdminLayout.statusMsg = AdminLayout.isEditing ? "Event berhasil di-update! 🎉" : "Berhasil! Event baru ditambahkan. 🎉";
      AdminLayout.cancelEdit(); // Kosongkan form & reset mode
      await AdminLayout.fetchHistory(); // Tarik ulang riwayat terbaru untuk di tabel
      
      setTimeout(() => { AdminLayout.statusMsg = ""; m.redraw(); }, 3000);
    } catch (error) {
      AdminLayout.statusMsg = "Gagal menyimpan data. Cek koneksi server.";
    }
  },

  view: () => {
    if (!AdminLayout.isLoggedIn) {
      // --- (Sama dengan sebelumnya, form login) ---
      return m("div", { class: "min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" },
        m("div", { class: "bg-slate-800 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700 w-full max-w-md" },
          m("div", { class: "text-center mb-8" },
            m("h1", { class: "text-3xl font-bold text-white tracking-tight" }, "Admin", m("span", { class: "text-indigo-500" }, "Panel"))
          ),
          m("form", { class: "flex flex-col gap-5", onsubmit: AdminLayout.handleLogin },
            m("div",
              m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "Username"),
              m("input", { type: "text", class: "w-full p-3 bg-slate-900/50 rounded-lg border border-slate-600 text-white outline-none", value: AdminLayout.loginData.username, oninput: (e) => AdminLayout.loginData.username = e.target.value, required: true })
            ),
            m("div",
              m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "Password"),
              m("input", { type: "password", class: "w-full p-3 bg-slate-900/50 rounded-lg border border-slate-600 text-white outline-none", value: AdminLayout.loginData.password, oninput: (e) => AdminLayout.loginData.password = e.target.value, required: true })
            ),
            AdminLayout.loginError ? m("p", { class: "text-rose-400 text-sm text-center bg-rose-400/10 py-2 rounded" }, AdminLayout.loginError) : null,
            m("button", { type: "submit", class: "w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold" }, "Masuk")
          )
        )
      );
    }

    return m("div", { class: "min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8" },
      m("div", { class: "max-w-6xl mx-auto" },
        
        m("div", { class: "flex justify-between items-center bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 mb-8" },
          m("div",
            m("h1", { class: "text-2xl font-bold text-white" }, "Dashboard Admin"),
            m("p", { class: "text-slate-400 text-sm mt-1" }, "Kelola arsip event dan memori")
          ),
          m("button", { onclick: AdminLayout.handleLogout, class: "px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg font-medium border border-rose-500/20" }, "Logout")
        ),

        // --- BAGIAN 1: FORM (Tambah / Edit) ---
        m("div", { class: `bg-slate-800 rounded-2xl shadow-lg border ${AdminLayout.isEditing ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-700'} overflow-hidden mb-8` },
          m("div", { class: `border-b ${AdminLayout.isEditing ? 'border-amber-500/30 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50'} p-6 flex justify-between items-center` },
            m("h2", { class: `text-lg font-semibold flex items-center gap-2 ${AdminLayout.isEditing ? 'text-amber-400' : 'text-indigo-400'}` }, 
              AdminLayout.isEditing ? "✏️ Mode Edit Event" : "➕ Tambah Event Baru"
            ),
            AdminLayout.isEditing ? m("button", { onclick: AdminLayout.cancelEdit, class: "text-sm text-slate-400 hover:text-white" }, "Batal Edit ✕") : null
          ),
          
          m("form", { class: "p-6", onsubmit: AdminLayout.submitData },
            m("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-8" },
              m("div", { class: "flex flex-col gap-5" },
                m("div",
                  m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "ID Event Unik (Kunci Data)"),
                  m("input", { 
                    class: `w-full p-3 bg-slate-900 rounded-lg border border-slate-600 focus:border-indigo-500 outline-none ${AdminLayout.isEditing ? 'opacity-50 cursor-not-allowed' : ''}`, 
                    placeholder: "contoh: pbb-bogor-2026", value: AdminLayout.formData.id, oninput: (e) => AdminLayout.formData.id = e.target.value, required: true,
                    disabled: AdminLayout.isEditing // ID tidak boleh diedit agar tidak merusak data lain
                  })
                ),
                m("div",
                  m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "Nama Pendek (Untuk Navbar)"),
                  m("input", { class: "w-full p-3 bg-slate-900 rounded-lg border border-slate-600 focus:border-indigo-500 outline-none", placeholder: "PBB Bogor", value: AdminLayout.formData.shortTitle, oninput: (e) => AdminLayout.formData.shortTitle = e.target.value, required: true })
                ),
                m("div",
                  m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "Judul Lengkap Konser"),
                  m("input", { class: "w-full p-3 bg-slate-900 rounded-lg border border-slate-600 focus:border-indigo-500 outline-none", placeholder: "Pesta Bebas Berselancar Vol.4", value: AdminLayout.formData.title, oninput: (e) => AdminLayout.formData.title = e.target.value, required: true })
                ),
                m("div",
                  m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "Deskripsi / Keseruan Momen"),
                  m("textarea", { class: "w-full p-3 bg-slate-900 rounded-lg border border-slate-600 focus:border-indigo-500 outline-none h-28", placeholder: "Ceritakan sedikit tentang event ini...", value: AdminLayout.formData.desc, oninput: (e) => AdminLayout.formData.desc = e.target.value, required: true })
                )
              ),
              m("div", { class: "flex flex-col gap-5" },
                m("div",
                  m("label", { class: "text-slate-300 text-sm font-medium mb-1 block" }, "Arsip Foto (Google Drive Links)"),
                  m("textarea", { class: "w-full p-3 bg-slate-900 rounded-lg border border-slate-600 focus:border-indigo-500 outline-none h-32 whitespace-nowrap overflow-x-auto", placeholder: "https://drive.google.com/...\n", value: AdminLayout.formData.galleryInput, oninput: (e) => AdminLayout.formData.galleryInput = e.target.value })
                ),
                m("div",
                  m("label", { class: "text-slate-300 text-sm font-medium mb-1 block mt-2" }, "Arsip Video (Google Drive Links)"),
                  m("textarea", { class: "w-full p-3 bg-slate-900 rounded-lg border border-slate-600 focus:border-indigo-500 outline-none h-32 whitespace-nowrap overflow-x-auto", placeholder: "https://drive.google.com/...\n", value: AdminLayout.formData.videosInput, oninput: (e) => AdminLayout.formData.videosInput = e.target.value })
                )
              )
            ),
            m("div", { class: "mt-8 pt-6 border-t border-slate-700 flex flex-col items-center" },
              m("button", { 
                type: "submit", 
                class: `px-8 py-3 font-bold rounded-lg transition-all text-white ${AdminLayout.isEditing ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'}` 
              }, AdminLayout.isEditing ? "Simpan Perubahan" : "Simpan Event Baru"),
              AdminLayout.statusMsg ? m("div", { class: "mt-4 text-emerald-400 font-medium" }, AdminLayout.statusMsg) : null
            )
          )
        ),

        // --- BAGIAN 2: TABEL RIWAYAT EVENT ---
        m("div", { class: "bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden" },
          m("div", { class: "border-b border-slate-700 p-6 bg-slate-800/50" },
            m("h2", { class: "text-lg font-semibold text-white flex items-center gap-2" }, "🗃️ Riwayat Event Tersimpan")
          ),
          m("div", { class: "p-6 overflow-x-auto" },
            AdminLayout.concertList.length === 0 ? 
              m("p", { class: "text-center text-slate-500 py-8" }, "Belum ada event yang tersimpan.")
            :
              m("table", { class: "w-full text-left border-collapse" },
                m("thead", { class: "bg-slate-900/50" },
                  m("tr",
                    m("th", { class: "p-4 text-slate-400 font-medium text-sm border-b border-slate-700" }, "ID"),
                    m("th", { class: "p-4 text-slate-400 font-medium text-sm border-b border-slate-700" }, "Nama Pendek"),
                    m("th", { class: "p-4 text-slate-400 font-medium text-sm border-b border-slate-700" }, "Total Media"),
                    m("th", { class: "p-4 text-slate-400 font-medium text-sm border-b border-slate-700 text-right" }, "Aksi")
                  )
                ),
                m("tbody",
                  AdminLayout.concertList.map(concert => 
                    m("tr", { class: "hover:bg-slate-700/30 transition-colors" },
                      m("td", { class: "p-4 border-b border-slate-700/50 font-mono text-sm text-indigo-300" }, concert.id),
                      m("td", { class: "p-4 border-b border-slate-700/50 text-white" }, concert.shortTitle),
                      m("td", { class: "p-4 border-b border-slate-700/50 text-slate-400 text-sm" }, 
                        `${concert.gallery ? concert.gallery.length : 0} Foto | ${concert.videos ? concert.videos.length : 0} Video`
                      ),
                      m("td", { class: "p-4 border-b border-slate-700/50 text-right space-x-3" },
                        m("button", { 
                          class: "text-amber-400 hover:text-amber-300 font-medium text-sm px-3 py-1 bg-amber-400/10 rounded",
                          onclick: () => AdminLayout.editEvent(concert)
                        }, "Edit"),
                        m("button", { 
                          class: "text-rose-400 hover:text-rose-300 font-medium text-sm px-3 py-1 bg-rose-400/10 rounded",
                          onclick: () => AdminLayout.deleteEvent(concert.id)
                        }, "Hapus")
                      )
                    )
                  )
                )
              )
          )
        )

      )
    );
  }
};

export default AdminLayout;