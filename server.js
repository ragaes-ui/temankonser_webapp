const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // <--- Panggil Bcrypt

const app = express();
app.use(cors());
app.use(express.json());

// 1. KONEKSI MONGODB YANG AMAN UNTuk VERCEL SERVERLESS
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect("mongodb+srv://temankonser_db:raga151204@cluster0.xak7oyy.mongodb.net/temankonser_db?retryWrites=true&w=majority", {
      serverSelectionTimeoutMS: 5000 // Batas waktu koneksi agar tidak gantung
    });
    isConnected = true;
    console.log("MongoDB Terhubung! 🎉");
    await buatAkunAdminPertama();
  } catch (err) {
    console.log("Yah, gagal terhubung:", err);
  }
};

// Middleware agar setiap ada request API, database dipastikan connect dulu
app.use(async (req, res, next) => {
  await connectDB();
  next();
});


// ==========================================
// 2. SKEMA DATABASE
// ==========================================

// Skema Konser (Yang sudah ada)
const concertSchema = new mongoose.Schema({
  id: String,
  shortTitle: String,
  title: String,
  desc: String,
  gallery: [String],
  videos: [String]
});
const Concert = mongoose.model("Concert", concertSchema);

// Skema Admin Baru
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true } // Akan berisi password acak (hash)
});
const Admin = mongoose.model("Admin", adminSchema);


// ==========================================
// 3. FUNGSI PEMBUAT ADMIN OTOMATIS
// ==========================================
// Fungsi ini akan mengecek apakah di database sudah ada admin.
// Kalau belum, dia akan membuatkannya otomatis beserta password yang di-hash.
const buatAkunAdminPertama = async () => {
  const adminAda = await Admin.findOne({ username: "raga" });
  
  if (!adminAda) {
    // Proses Hashing Password (mengacak password "admin123")
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminBaru = new Admin({
      username: "raga",
      password: hashedPassword // Yang disimpan adalah versi acak-nya
    });

    await adminBaru.save();
    console.log("Akun Admin 'raga' berhasil ditambahkan ke Database dengan password Hashed! 🔒");
  }
};


// ==========================================
// 4. API ENDPOINT ROUTING
// ==========================================

// API Login (Sekarang mengecek ke Database)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 1. Cari username di database
    const adminUser = await Admin.findOne({ username: username });
    
    if (!adminUser) {
      return res.status(401).json({ success: false, message: "Username tidak ditemukan!" });
    }

    // 2. Cocokkan password yang diketik dengan password Hash di database
    const passwordCocok = await bcrypt.compare(password, adminUser.password);

    if (passwordCocok) {
      res.json({ success: true, token: "token-sah-raga" }); // Berhasil masuk
    } else {
      res.status(401).json({ success: false, message: "Password salah mas!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server." });
  }
});

// API Get Semua Konser
app.get("/api/concerts", async (req, res) => {
  try {
    const concerts = await Concert.find();
    res.json(concerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API Tambah Konser Baru
app.post("/api/concerts", async (req, res) => {
  try {
    const newConcert = new Concert(req.body);
    const savedConcert = await newConcert.save();
    res.status(201).json(savedConcert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// API Update Konser (Edit Data & Tambah Foto)
app.put("/api/concerts/:id", async (req, res) => {
  try {
    // Mencari konser berdasarkan ID, lalu menimpanya dengan data baru dari form
    const updatedConcert = await Concert.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    res.json(updatedConcert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API Hapus Konser
app.delete("/api/concerts/:id", async (req, res) => {
  try {
    await Concert.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: "Konser berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Kalau sebelumnya cuma begini:
// app.listen(3000, () => console.log("Server running..."));

// UBAH MENJADI SEPERTI INI UNTUK VERCEL:
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}

// WAJIB ADA BARIS INI AGAR VERCEL BISA MEMBACA API MAS:
module.exports = app;