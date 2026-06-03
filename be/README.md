# SATUSEHAT BFF Backend

Backend Node.js yang berfungsi sebagai **Backend-for-Frontend (BFF)** untuk integrasi dengan API SATUSEHAT Kementerian Kesehatan Republik Indonesia. 

Backend ini menjembatani aplikasi frontend dengan kompleksitas standar FHIR R4 yang digunakan oleh SATUSEHAT, menangani autentikasi, terjemahan parameter, dan standarisasi penanganan error.

## 🌟 Fitur Utama

- **Otomatisasi Autentikasi (OAuth2):** Mengambil dan menyimpan `access_token` secara otomatis dari SATUSEHAT (In-memory caching).
- **Backend-for-Frontend (BFF) Pattern:** Menyembunyikan kompleksitas format FHIR identifier (seperti URI system Kemenkes) dari frontend. Frontend cukup mengirim NIK/NIP yang bersih.
- **Standarisasi Error Handling:** Menangkap *OperationOutcome* error dari SATUSEHAT dan menerjemahkannya ke format JSON yang konsisten dan mudah dibaca oleh frontend.
- **Swagger API Docs:** Dilengkapi dengan dokumentasi Swagger UI terintegrasi.

## 🛠️ Teknologi yang Digunakan

- **Node.js** & **Express.js** (Web Framework)
- **Axios** (HTTP Client untuk komunikasi dengan API SATUSEHAT)
- **Dotenv** (Manajemen Environment Variables)
- **Cors** (Cross-Origin Resource Sharing)
- **Swagger UI Express** (Dokumentasi API)

---

## 🚀 Setup & Instalasi

### 1. Kebutuhan Sistem
- Node.js versi 14 atau lebih baru
- Akun SATUSEHAT Platform (SSP) untuk environment Staging/Sandbox

### 2. Instalasi Dependencies
Buka terminal, arahkan ke folder `be`, dan jalankan:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` di root folder `be` (sejajar dengan `package.json`). Isi dengan kredensial dari SATUSEHAT Platform Anda:

```env
PORT=8000
CLIENT_ID=client_id_anda
CLIENT_SECRET=client_secret_anda
AUTH_URL=https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1
BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1
```

### 4. Menjalankan Server
Untuk mode produksi:
```bash
npm start
```

Untuk mode development (auto-restart saat ada perubahan kode):
```bash
npm run dev
```

Server akan berjalan di `http://localhost:8000`.

---

## 📂 Struktur Proyek

```text
be/
├── config/
│   └── index.js           # Validasi dan pemuatan variabel lingkungan (.env)
├── controllers/
│   └── fhirController.js  # Mengatur logika request/response untuk endpoint FHIR
├── routes/
│   ├── auth.js            # Endpoint khusus untuk testing autentikasi
│   └── fhir.js            # Routing endpoint untuk seluruh resource FHIR
├── services/
│   ├── satusehatService.js# Layer komunikasi HTTP ke SATUSEHAT & BFF Translators
│   └── tokenService.js    # Mengatur logika generate dan caching access_token
├── .env                   # Kredensial rahasia (TIDAK di-commit ke Git)
├── index.js               # Entry point aplikasi Express
├── POSTMAN_GUIDE.md       # Panduan langkah-demi-langkah testing dengan Postman
└── swagger.json           # Definisi OpenAPI untuk Swagger UI
```

---

## 📡 Daftar Endpoint API

Semua request dan response menggunakan format `application/json`.
Untuk testing flow lengkap (termasuk dummy data), silakan baca file `POSTMAN_GUIDE.md`.

### Dokumentasi Interaktif (Swagger UI)
Kunjungi browser: `http://localhost:8000/api/docs`

---

### 1. Autentikasi
Backend menangani token secara internal, tetapi endpoint ini tersedia untuk memastikan kredensial valid.

- **URL:** `GET /api/auth/test-auth`
- **Tujuan:** Menguji koneksi ke server OAuth2 SATUSEHAT.

---

### 2. Pasien (Patient)

- **URL:** `GET /api/fhir/patient`
- **Parameter BFF yang Didukung:**
  - `?nik=16_digit_angka` *(BFF otomatis menerjemahkannya ke URI format FHIR Kemenkes)*
  - `?name=nama_pasien`
  - `?birthdate=YYYY-MM-DD`
- **URL (POST):** `POST /api/fhir/patient` (Kirim raw payload FHIR Patient)

---

### 3. Tenaga Kesehatan (Practitioner)

- **URL:** `GET /api/fhir/practitioner`
- **Parameter BFF yang Didukung:**
  - `?nik=16_digit_angka`
  - `?nip=18_digit_angka`
  - `?name=nama_dokter`
- **URL (POST):** `POST /api/fhir/practitioner` (Kirim raw payload FHIR Practitioner)

---

### 4. Lokasi / Ruangan (Location)

- **URL:** `GET /api/fhir/location`
- **Parameter BFF yang Didukung:** `?name=`, `?status=`, `?identifier=`
- **URL (POST):** `POST /api/fhir/location`
  - **Tujuan:** Mendaftarkan ruangan di dalam faskes (contoh: Poli Umum). Akan mengembalikan UUID Lokasi.


---

### 5. Kunjungan Medis (Encounter)

Endpoint ini adalah klimaks dari clinical flow. Menggabungkan Patient IHS, Practitioner IHS, dan Location UUID.

- **URL (POST):** `POST /api/fhir/encounter`
- **Tujuan:** Mendaftarkan kunjungan pasien ke SATUSEHAT.
- **Validasi Ketat SATUSEHAT:** 
  - Wajib memiliki block `identifier`.
  - `serviceProvider` wajib menggunakan referensi Kode Faskes, bukan UUID.

---

## 🛡️ Format Standar Response & Error Handling

Backend ini menggunakan kelas `FhirError` khusus untuk menangkap masalah komunikasi, penolakan bisnis (validasi FHIR), atau masalah network. Frontend **selalu** menerima struktur JSON yang seragam.

**Contoh Response Sukses (200 / 201):**
```json
{
  "success": true,
  "data": { ... resource FHIR dari SATUSEHAT ... }
}
```

**Contoh Response Error (400, 401, 404, 422, 500):**
```json
{
  "success": false,
  "message": "Terjemahan error dalam bahasa Indonesia yang ramah pengguna.",
  "details": [
    {
      "severity": "error",
      "code": "invalid",
      "diagnostics": "Pesan error teknis asli dari OperationOutcome SATUSEHAT (berguna untuk debugging)."
    }
  ]
}
```

## 🧠 Konsep Backend-for-Frontend (BFF) Translation

Untuk menghindari kebocoran URL sistem spesifik FHIR ke Frontend, backend melakukan translasi secara diam-diam (*under-the-hood*).

**Contoh Kasus Pencarian NIK Pasien:**

Frontend hanya perlu memanggil:
`GET /api/fhir/patient?nik=9271060312000001`

Backend akan memproses dan meneruskan permintaan ke SATUSEHAT sebagai:
`GET /Patient?identifier=https://fhir.kemkes.go.id/id/nik|9271060312000001`

Logika translasi ini dapat ditemukan pada file `services/satusehatService.js`.
