# Edlink LMS — Role-Based Access Control (RBAC) System

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Elysia%20%7C%20Prisma%20%7C%20Supabase-blue)](https://github.com/DrT9530/pwl-rbac-edlink)
[![Deployment](https://img.shields.io/badge/Deployed%20to-Vercel-black?logo=vercel)](https://vercel.com)

Sebuah aplikasi **Learning Management System (LMS)** modern yang terinspirasi oleh Edlink. Proyek ini berfokus pada implementasi **Role-Based Access Control (RBAC)** yang ketat dan granular untuk mendukung kebutuhan administrasi kampus, dosen, mahasiswa, hingga asisten dosen.

Proyek ini dibangun sebagai bagian dari tugas besar mata kuliah **Pemrograman Web Lanjut (PWL)** Semester 4.

---

## 👥 Anggota Kelompok

Berikut adalah daftar anggota kelompok pengembang:

| No | Nama Lengkap | NIM |
| :-: | :--- | :---: |
| 1 | **VIRSYA MEIDINA ANDRIADIE** | H1101241004 |
| 2 | **MAS JIHAN AFRA AUZIA** | H1101241011 |
| 3 | **RADIKA TRIEZA ARITONANG** | H1101241024 |
| 4 | **JESIKA TAN** | H1101241033 |
| 5 | **ATHALLAH RIZKY ERIN SAPUTRA** | H1101241042 |
| 6 | **SHALWA NAFIISA YUSRI** | H1101241065 |

---

## 📘 Laporan Proyek

Dokumentasi lengkap mengenai rancangan sistem, skema basis data, pengujian, serta analisis keamanan sistem dapat diakses pada tautan berikut:

🔗 **[Baca Laporan Tugas Besar Lengkap di Sini (Google Drive / PDF)] (https://github.com/DrT9530/pwl-rbac-edlink)** *(Silakan sesuaikan tautan ini dengan tautan laporan Anda)*

---

## 🛠️ Tech Stack & Arsitektur

Sistem ini dikembangkan dengan arsitektur monorepo terpisah yang memisahkan sisi Client (Frontend) dan API (Backend):

### 🖥️ Frontend (Client)
*   **Framework & Core**: [React.js](https://react.dev/) dengan [Vite](https://vite.dev/) (menjamin kecepatan kompilasi yang instan).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) untuk desain modern, bersih, dan sepenuhnya responsif (mobile-friendly).
*   **HTTP Client**: [Axios](https://axios-http.com/) untuk komunikasi data asinkron dengan API server.
*   **Icons**: [Lucide React](https://lucide.dev/) untuk koleksi ikon UI premium dan modern.

### ⚙️ Backend (API Server)
*   **Runtime Engine**: [Bun](https://bun.sh/) (menawarkan performa eksekusi JavaScript/TypeScript super cepat dibandingkan Node.js).
*   **Framework**: [ElysiaJS](https://elysiajs.com/) (framework modern berkecepatan tinggi dengan tipe data TypeScript end-to-end yang ketat).
*   **Database ORM**: [Prisma ORM](https://www.prisma.io/) untuk interaksi basis data yang aman dan terstruktur.
*   **Database Cloud Hosting**: [Supabase](https://supabase.com/) dengan engine **PostgreSQL** yang andal.
*   **Keamanan & Autentikasi**:
    *   **Stateless JWT (JSON Web Token)** untuk otorisasi sesi pengguna secara aman.
    *   **bcryptjs** untuk hashing password satu arah sebelum disimpan di database.

---

## 🔐 Tingkat Otoritas Akses (RBAC Model)

Sistem ini memiliki dua kategori hak akses yang dipetakan secara granular:

### 1. Peran Global (Global Roles)
Mengatur akses di tingkat aplikasi secara keseluruhan (fitur administrasi sistem):
*   **Super Admin:** Memiliki hak penuh untuk mengelola pengguna (tambah, edit, hapus) dan menetapkan hak akses global di aplikasi.
*   **Campus Admin:** Memiliki otoritas di bawah Super Admin untuk mengelola pengguna, mereset password, dan meninjau dashboard statistik kampus.
*   **IT Support:** Memiliki akses operasional seperti melihat daftar pengguna serta melakukan reset password saat terjadi kendala teknis.

### 2. Peran Kelas (Course Roles)
Mengatur otoritas dinamis yang hanya berlaku di dalam suatu kelas tertentu (*course-scoped permissions*):
*   **Dosen:** Membuat materi/tugas baru di dalam kelas, melihat seluruh unggahan tugas mahasiswa, serta memberikan nilai dan umpan balik (*feedback*).
*   **Asisten Dosen (Asdos):** Membantu dosen dalam meninjau kiriman tugas mahasiswa dan dapat berpartisipasi dalam diskusi kelas.
*   **Mahasiswa:** Melihat detail kelas, mengunduh tugas, serta mengunggah file solusi tugas sebelum tenggat waktu.

---

## 🚀 Menjalankan Proyek secara Lokal

### Prerequisites
Pastikan Anda sudah menginstal:
*   [Bun](https://bun.sh/) (Disarankan untuk backend)
*   [Node.js](https://nodejs.org/) & [NPM](https://www.npmjs.com/) (Untuk frontend)

### 1. Setup Backend
1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Instal dependensi menggunakan Bun:
   ```bash
   bun install
   ```
3. Salin file `.env.example` ke `.env` lalu sesuaikan kredensial database Supabase Anda:
   ```env
   DATABASE_URL="postgresql://username:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://username:password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
   JWT_SECRET="masukkan-rahasia-jwt-anda"
   PORT=3000
   ```
4. Jalankan migrasi skema database dan jalankan data *seeding* (membuat akun contoh):
   ```bash
   bun x prisma db push
   bun x prisma db seed
   ```
5. Jalankan server dalam mode pengembangan:
   ```bash
   bun run dev
   ```

### 2. Setup Frontend
1. Masuk ke direktori `frontend` (dari root folder):
   ```bash
   cd frontend
   ```
2. Instal dependensi menggunakan NPM:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan frontend:
   ```bash
   npm run dev
   ```
4. Buka browser Anda dan akses `http://localhost:5173`.

---

## 🔑 Akun Uji Coba (Seed Data)

Gunakan daftar akun berikut untuk langsung masuk dan menguji sistem RBAC:

### 1. Akun Admin Global (Password: `adminedlink123`)
*   **Super Admin:** `admin@edlink.com`
*   **Campus Admin:** `campus@edlink.com`
*   **IT Support:** `it@edlink.com`

### 2. Akun Kelas / Dosen / Mahasiswa (Password: `password123`)
*   **Dosen:** `ahmad@edlink.com` / `budi@edlink.com`
*   **Mahasiswa:** `siti@edlink.com` / `andi@edlink.com` / `rina@edlink.com`
*   **Asisten Dosen (Asdos):** `dimas@edlink.com`
