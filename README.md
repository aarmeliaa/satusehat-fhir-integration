# Integrasi API SATUSEHAT - Pendaftaran Pasien (FHIR R4)

Repositori ini berisi implementasi frontend `Next.js` dan backend `Node.js (Express)` untuk mensimulasikan proses pendaftaran pasien terintegrasi dengan API SATUSEHAT Kemenkes RI.

## Anggota Kelompok
1. 24/534245/SV/24017 - Ayu Mirnawati
2. 24/534872/SV/24103 - Alvista Maula Zahra
3. 24/538562/SV/24509 - Azzahra Armelia Aina
4. 24/539894/SV/24706 - Faradis Yulianto
5. 24/540019/SV/24747 - Muhammad Adib Naziri
6. 24/542538/SV/25053 - Raihananta Khoiril Anam Pitoyo
7. 24/544362/SV/25396 - Khaylila Zahra Ardhya Sebayang
8. 24/545049/SV/25592 - Aliya Khansa Kamaliya

## Arsitektur Proyek
- `be/` — backend Express yang mengelola otentikasi OAuth SATUSEHAT, proxy FHIR request, dan dokumentasi Swagger.
- `fe/` — frontend Next.js yang menampilkan UI dan memanggil backend.

## Tech Stack
- Backend: Node.js, Express.js, Axios, dotenv
- Frontend: Next.js, React, Tailwind CSS
- API docs: Swagger UI

## Cara Menjalankan Backend (Setup)
1. Clone repositori ini:
   ```bash
   git clone https://github.com/aarmeliaa/satusehat-fhir-integration.git
   ```
2. Masuk ke folder backend dan install dependencies:
   ```bash
   cd be
   npm install
   ```
3. Buat file `.env` di folder `be/`. Minta credentials dari perwakilan kelompok yang memegang akun DTO Kemenkes, lalu isi dengan format berikut:
   ```bash
   PORT=3000
   CLIENT_ID=isi_dengan_client_id_sandbox
   CLIENT_SECRET=isi_dengan_client_secret_sandbox
   AUTH_URL=https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1
   BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1
   ```
4. Jalankan backend server:
   ```bash
   node index.js
   ```
5. Buka dokumentasi API:
   ```bash
   http://localhost:3000/api/docs
   ```

## Backend Status
Backend sudah terpasang dengan:
- Authentication token SATUSEHAT (OAuth client_credentials)
- Route pencarian resource FHIR: `Patient`, `Practitioner`, `Location`
- Route pembuatan resource FHIR: `Patient`, `Practitioner`, `Location`, `Encounter`
- Swagger/OpenAPI documentation di `/api/docs`

## Frontend
- Folder frontend ada di `fe/`
- Framework: Next.js
- Untuk menjalankan frontend, gunakan:
  ```bash
  cd fe
  npm install
  npm run dev -- -p 3001
  ```
- Buka aplikasi di browser:
  ```bash
  http://localhost:3001
  ```

## Endpoint Backend Utama
- `GET /api/auth/test-auth` — tes pengambilan token
- `POST /api/fhir/patient` — buat `Patient`
- `POST /api/fhir/practitioner` — buat `Practitioner`
- `POST /api/fhir/location` — buat `Location`
- `POST /api/fhir/encounter` — buat `Encounter`
- `GET /api/fhir/patient?name=...` — cari pasien
- `GET /api/fhir/practitioner?...` — cari dokter
- `GET /api/fhir/location?...` — cari lokasi

## Progress Saat Ini
- [x] Inisialisasi project dan repositori GitHub
- [x] Mendapatkan `Access Token`
- [x] Pencarian data referensi (IHS pasien dan dokter)
- [x] Persiapan lokasi (`POST Location`)
- [x] Pendaftaran kunjungan (`POST Encounter`)

## Catatan
- Pastikan `.env` di `be/` tidak dicommit ke Git.
- Jika ingin mengubah port backend, ubah nilai `PORT` di file `.env`.
- Dokumentasi Swagger hanya tersedia setelah backend berjalan.
