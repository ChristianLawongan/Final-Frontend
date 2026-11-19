# SIMS — Sistem Informasi Manajemen Skripsi

*Final Project Front End | Fakultas Ilmu Komputer UNKLAB*

Aplikasi web untuk pengelolaan alur skripsi mahasiswa, bimbingan/konsultasi akademik, dan penjadwalan ujian defense berbantuan AI (Google Gemini).

---

## 🌟 Fitur Utama

1. **Manajemen Riwayat Konsultasi:**
   - Dosen mencatat hasil konsultasi dan arahan revisi.
   - Mahasiswa dapat mengajukan bimbingan dan memantau progres.
   - Ekspor / Cetak **Kartu Kontrol Bimbingan Skripsi** resmi ke format PDF/cetak.
2. **Penjadwalan Defense Berbantuan AI (Google Gemini):**
   - AI menganalisis abstrak skripsi dan merekomendasikan dosen penguji berdasarkan keahlian & riwayat riset dosen.
   - Admin menentukan penguji, tanggal, waktu, dan lokasi ujian.
   - Publikasi jadwal defense langsung ke portal Dosen dan Mahasiswa.
3. **Portal Mahasiswa (Skripsi Saya):**
   - Progress tracker tahapan skripsi dari Proposal hingga Selesai.
   - Pengajuan & pembaruan draf topik skripsi.
   - Fitur analisis topik instan dengan Gemini AI.
   - Indikator pemenuhan syarat minimal bimbingan (3/3 Sesi).
4. **Dashboard Dinamis Multirole:**
   - Informasi statistik dan ringkasan disesuaikan untuk Admin, Dosen, dan Mahasiswa.

---

## 👥 Role & Akun Demo

| Role | Email | Password |
|---|---|---|
| **Admin / Kaprodi** | `stenly@unklab.ac.id` | `admin123` |
| **Dosen** | `enrico@unklab.ac.id` | `dosen123` |
| **Mahasiswa** | `1234@unklab.ac.id` | `mhs123` |

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, React Router v7
- **Backend AI:** Express.js, `@google/genai` (Gemini 2.5 Flash Lite)
- **Database:** JSON Server (`db.json`)
- **Version Control:** Git & GitHub

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Clone & Instal Dependensi
```bash
git clone <url-repository-anda>
cd sims
npm install
```

### 2. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env` dan tambahkan Gemini API Key Anda:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Jalankan Aplikasi
Jalankan frontend, server mock DB, dan backend AI:
```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - JSON Server (Port 3002)
npm run server:db

# Terminal 3 - Backend Gemini AI (Port 3001)
node server/index.js
```
Akses aplikasi melalui browser di `http://localhost:5173`.
