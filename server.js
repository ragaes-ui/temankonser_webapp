const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // <--- Panggil Bcrypt
const { GoogleGenerativeAI } = require("@google/generative-ai"); // <--- PANGGIL GEMINI

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Gemini API (Kuncinya akan kita taruh di Vercel nanti)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "KUNCI_KOSONG");

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
  // Cukup cari apakah ADA admin, tidak usah spesifik nama "raga"
  const adminAda = await Admin.findOne(); 
  
  if (!adminAda) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    const adminBaru = new Admin({ username: "raga", password: hashedPassword });
    await adminBaru.save();
    console.log("Akun Admin awal berhasil ditambahkan! 🔒");
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
// API Ubah Username & Password
app.put("/api/admin/settings", async (req, res) => {
  const { oldPassword, newUsername, newPassword } = req.body;
  
  try {
    // Ambil akun admin yang sedang login (karena cuma 1, ambil yang pertama)
    const adminUser = await Admin.findOne(); 
    if (!adminUser) return res.status(404).json({ success: false, message: "Admin tidak ditemukan" });

    // Cek apakah password lama yang dimasukkan benar
    const passwordCocok = await bcrypt.compare(oldPassword, adminUser.password);
    if (!passwordCocok) {
      return res.status(401).json({ success: false, message: "Password Lama Salah!" });
    }

    // Update data
    adminUser.username = newUsername || adminUser.username;
    
    // Jika kolom password baru diisi, acak lagi passwordnya
    if (newPassword && newPassword.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(newPassword, salt);
    }

    await adminUser.save();
    res.json({ success: true, message: "Akun berhasil diupdate! Silakan login ulang nanti." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server." });
  }
});

// --- API CHATBOT GEMINI AI (BARU) ---
app.post("/api/tanya", async (req, res) => {
  try {
    const { pesan } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: "Sistem AI belum di-setting oleh Admin (API Key belum ada)." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prompt khusus agar Gemini bertingkah seperti asisten musik
    const prompt = `Kamu adalah asisten AI gaul bernama 'Teman Konser Bot'. Tugasmu menjawab pertanyaan pengunjung web arsip dokumentasi konser. Jawablah dengan singkat, ramah, santai, dan gunakan bahasa anak muda / penikmat musik (gue/lu/bro/sis). Pertanyaan pengunjung: ${pesan}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ reply: response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Waduh, otak AI gue lagi konslet nih bro, coba lagi nanti ya!" });
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
    // 1. Ambil data dari form, tapi HAPUS _id bawaan agar MongoDB tidak menolak update
    const dataUpdate = { ...req.body };
    delete dataUpdate._id; 

    // 2. Pencarian Fleksibel: Cari berdasarkan custom 'id' ATAU '_id' bawaan MongoDB
    const queryPencarian = {
      $or: [
        { id: req.params.id }
      ]
    };
    
    // Jika ID dari URL panjangnya pas 24 karakter (format khas MongoDB ObjectId), tambahkan ke pencarian
    if (req.params.id.length === 24) {
      queryPencarian.$or.push({ _id: req.params.id });
    }

    // 3. Eksekusi update
    const updatedConcert = await Concert.findOneAndUpdate(
      queryPencarian, 
      dataUpdate, 
      { new: true }
    );

    // 4. Jika data benar-benar tidak ada di database, lempar error
    if (!updatedConcert) {
      return res.status(404).json({ success: false, message: "Aduh, data tidak ditemukan di database!" });
    }

    // 5. Berhasil!
    res.json(updatedConcert);
    
  } catch (err) {
    console.error("Gagal Update:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});


// API Hapus Konser
app.delete("/api/concerts/:id", async (req, res) => {
  try {
    // Pencarian Fleksibel sama seperti saat Update
    const queryPencarian = { $or: [{ id: req.params.id }] };
    
    if (req.params.id.length === 24) {
      queryPencarian.$or.push({ _id: req.params.id });
    }

    const deletedConcert = await Concert.findOneAndDelete(queryPencarian);
    
    if (!deletedConcert) {
      return res.status(404).json({ success: false, message: "Konser tidak ditemukan di database" });
    }

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