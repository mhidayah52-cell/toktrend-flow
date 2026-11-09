# TokTrend Flow — Platform Analisis Produk Trending TikTok Shop & AI Flow Studio

Web aplikasi MVP untuk affiliator dan kreator TikTok Shop di Indonesia, dibangun berdasarkan spesifikasi PRD menggunakan **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Prisma (SQLite)**.

## Fitur Utama (MVP v1.0)
1. **🔥 Leaderboard Produk Trending**: Filter kategori, minimal komisi afiliasi (%), pencarian kata kunci, dan pengurutan berdasarkan laju pertumbuhan 7 hari, unit terjual, GMV, atau nominal komisi per pcs.
2. **📊 Bedah Video & Kreator Teratas**: Modal detail produk yang menampilkan video penggerak omzet tertinggi beserta transkrip *hook* 3 detik pertama dan daftar akun kreator kontributor GMV terbesar.
3. **🔗 On-Demand TikTok Link Analyzer (`/api/scrape`)**: Masukkan tautan produk TikTok Shop untuk menarik estimasi metrik produk saat itu juga.
4. **🎬 Google Flow AI Studio (`/api/flow-generate`)**:
   - **Scene-by-Scene Prompt (3 Adegan / 12 Detik)** khusus rasio 9:16 untuk ditempel ke **Google Flow**.
   - **Flow "Ingredients" Spec (Image-to-Video)**: Daftar *Subject Lock* dan spesifikasi gambar produk bersih agar konsisten di semua adegan.
   - **Rekomendasi Hashtag 3 Lapis**: *Broad/Niche Tags*, *Product Specific Tags*, dan *Trending Affiliate Tags* + naskah *Voiceover (VO)*.
5. **🏪 Riset Toko & ⭐ Watchlist + Sistem Kuota Harian Freemium**.

---

## Cara Menjalankan di Komputer Lokal (Windows)

> **Catatan:** Jika komputer Anda belum terinstal **Node.js**, instal terlebih dahulu melalui PowerShell/Terminal dengan perintah:
> ```powershell
> winget install OpenJS.NodeJS.LTS
> ```
> Setelah selesai, tutup dan buka kembali terminal Anda.

1. **Masuk ke direktori proyek:**
   ```powershell
   cd C:\Users\mhida\.gemini\antigravity\scratch\toktrend-flow
   ```

2. **Instal dependensi paket:**
   ```powershell
   npm install
   ```

3. **Inisialisasi database SQLite & isi data awal (Seed):**
   ```powershell
   npm run db:push
   npm run db:seed
   ```

4. **Jalankan server development:**
   ```powershell
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.
