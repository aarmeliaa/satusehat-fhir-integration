# SATUSEHAT BFF — Frontend (Next.js)

Aplikasi web frontend untuk dashboard integrasi SATUSEHAT FHIR API. Dibangun menggunakan **Next.js 14 App Router**, **TypeScript**, dan **Tailwind CSS**.

Frontend ini berkomunikasi **hanya** dengan backend BFF (Backend-for-Frontend) di folder `be/` — tidak pernah langsung memanggil API SATUSEHAT.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Pastikan Backend Sudah Berjalan

Frontend membutuhkan backend BFF berjalan di port `8000`. Buka terminal pertama:

```bash
cd be
npm install
npm start   # atau: npm run dev
```

### 2. Install Dependencies Frontend

Buka terminal kedua:

```bash
cd fe
npm install
```

### 3. Konfigurasi Environment

Buat file `.env.local` di dalam folder `fe/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka browser di: **`http://localhost:3000`**

### 5. Login

Masukkan username dan password apapun (auth simulasi). Setelah login, kamu akan diarahkan ke `/dashboard/patient`.

---

## 🗂️ Struktur Halaman (App Router)

```
/dashboard/patient      → Modul Pasien (cari via NIK)
/dashboard/practitioner → Modul Praktisi (cari via NIK / Nama)
/dashboard/location     → Modul Lokasi (daftarkan ruangan)
/dashboard/encounter    → Modul Kunjungan Medis
```

---

## 🧪 Cara Tes dengan SATUSEHAT Sandbox

> **Environment Staging** SATUSEHAT hanya menyimpan data dummy resmi dari Kemenkes. NIK pribadi **tidak akan ditemukan**. Gunakan NIK berikut untuk testing.

---

### 📋 Alur Testing yang Benar (Sequential Flow)

Ikuti urutan ini agar berhasil membuat Encounter:

```
Langkah 1 → Cari Pasien (dapatkan IHS Number pasien)
Langkah 2 → Cari Praktisi (dapatkan IHS Number dokter)
Langkah 3 → Buat Lokasi (dapatkan Location UUID)
Langkah 4 → Buat Encounter (gunakan 3 ID dari langkah sebelumnya)
```

---

### Langkah 1 — Modul Pasien (`/dashboard/patient`)

Gunakan NIK dummy resmi Kemenkes berikut:

| NIK | Nama | IHS Number (FHIR ID) |
|---|---|---|
| `9271060312000001` | Ardianto Putra | `P02478375538` |
| `9204014804000002` | Claudia Sintia | `P03647103112` |
| `9104224509000003` | Elizabeth Dior | `P00805884304` |
| `9104224606000005` | Ghina Assyifa | `P01654557057` |
| `9104025209000006` | Salsabilla Anjani Rizki | `P02280547535` |
| `9201076001000007` | Theodore Elisjah | `P01836748436` |
| `9201394901000008` | Sonia Herdianti | `P00883356749` |
| `9201076407000009` | Nancy Wang | `P01058967035` |
| `9210060207000010` | Syarif Muhammad | `P02428473601` |

**Apa yang perlu dicatat:** Salin **IHS Number** dari kolom terakhir tabel hasil pencarian. Klik ikon copy di kolom tersebut.

---

### Langkah 2 — Modul Praktisi (`/dashboard/practitioner`)

Gunakan NIK dummy resmi Kemenkes berikut:

| NIK | Nama | IHS Number (FHIR ID) |
|---|---|---|
| `7209061211900001` | dr. Alexander | `10009880728` |
| `3322071302900002` | dr. Yoga Yandika, Sp.A. | `10006926841` |
| `3171071609900003` | dr. Syarifuddin, Sp.Pd. | `10001354453` |
| `3207192310600004` | dr. Nicholas Evan, Sp.B. | `10010910332` |
| `6408130207800005` | dr. Dito Arifin, Sp.M. | `10018180913` |
| `3217040109800006` | dr. Olivia Kirana, Sp.OG | `10002074224` |
| `3519111703800007` | dr. Alicia Chrissy, Sp.N. | `10012572188` |
| `5271002009700008` | dr. Nathalie Tan, Sp.PK. | `10018452434` |
| `3313096403900009` | Sheila Annisa S.Kep | `10014058550` |
| `3578083008700010` | apt. Aditya Pradhana, S.Farm. | `10001915884` |

**Apa yang perlu dicatat:** Salin **IHS Number** dokter dari kolom terakhir.

---

### Langkah 3 — Modul Lokasi (`/dashboard/location`)

Klik **Tambah Lokasi** dan isi form:

| Field | Contoh Isi |
|---|---|
| **Organization ID** | UUID dari portal SSP SATUSEHAT kamu |
| **Nama Lokasi** | `Poli Umum` |
| **Status** | `Aktif` |
| **Tipe Fisik** | `Ruangan (ro)` |

Setelah berhasil **(201 Created)**, tabel akan menampilkan **FHIR ID (Location UUID)** — salin dengan ikon copy.

> **Catatan:** Organization ID adalah UUID yang muncul saat kamu login ke portal SSP SATUSEHAT. Harus **sama** dengan akun pemilik `CLIENT_ID` dan `CLIENT_SECRET` di file `be/.env`.

---

### Langkah 4 — Modul Kunjungan Medis (`/dashboard/encounter`)

Isi form dengan data yang sudah dikumpulkan dari langkah sebelumnya:

| Field | Contoh |
|---|---|
| **NIK Pasien** | `9271060312000001` (lalu klik Verifikasi) |
| **IHS Praktisi** | `10009880728` |
| **Location ID** | UUID dari Langkah 3 (contoh: `4079d4e0-bf66-43f7-96b4-8e814a654511`) |
| **Organization ID** | UUID yang sama seperti di Langkah 3 |
| **Status** | `Tiba (arrived)` |

Klik **Kirim Kunjungan** — respons berhasil adalah **201 Created** dengan banner hijau yang menampilkan Encounter ID.

---

## 🛡️ Arsitektur BFF

Frontend ini **tidak pernah** membangun FHIR identifier string sendiri. Semua kompleksitas ditangani oleh backend BFF:

```
Frontend kirim:   GET /api/fhir/patient?nik=9271060312000001
Backend teruskan: GET /Patient?identifier=https://fhir.kemkes.go.id/id/nik|9271060312000001
```

Semua error dari SATUSEHAT diterjemahkan backend menjadi pesan bahasa Indonesia yang ramah pengguna:

```json
{ "success": false, "message": "Pesan yang mudah dibaca", "details": [...] }
```

Frontend hanya menampilkan `message` — `details` teknis disimpan di console browser untuk debugging.

---

## 🔧 Script yang Tersedia

```bash
npm run dev      # Development server dengan hot-reload
npm run build    # Build production bundle
npm run start    # Jalankan production build
npm run lint     # ESLint check
```

---

## 📦 Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Next.js | 14 | App Router, SSR/CSR |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Styling |
| Axios | 1.x | HTTP client ke BFF backend |
| Lucide React | latest | Icon library |
