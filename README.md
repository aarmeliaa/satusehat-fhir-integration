# Integrasi API SATUSEHAT - Pendaftaran Pasien (FHIR R4)

Repositori ini berisi implementasi backend menggunakan `Node.js (Express.js)` untuk mensimulasikan proses pendaftaran pasien terintegrasi dengan API SATUSEHAT Kemenkes RI di environment Sandbox.

## Anggota Kelompok
1. 24/534245/SV/24017 - Ayu Mirnawati
2. 24/534872/SV/24103 - Alvista Maula Zahra
3. 24/538562/SV/24509 - Azzahra Armelia Aina
4. 24/539894/SV/24706 - Faradis Yulianto
5. 24/540019/SV/24747 - Muhammad Adib Naziri
6. 24/542538/SV/25053 - Raihananta Khoiril Anam Pitoyo
7. 24/544362/SV/25396 - Khaylila Zahra Ardhya Sebayang
8. 24/545049/SV/25592 - Aliya Khansa Kamaliya

## Tumpukan Teknologi (Tech Stack)
* **Runtime:** Node.js
* **Framework:** Express.js
* **HTTP Client:** Axios
* **Environment Configuration:** dotenv

## Cara Menjalankan Project (Setup)
1. Clone repositori ini:
   ```bash
   git clone https://github.com/aarmeliaa/satusehat-fhir-integration.git 
   ```
2. Masuk ke folder project dan install dependencies:
    ```bash
    npm install
    ```
3. Buat file .env di root folder. Minta credentials dari perwakilan kelompok yang memegang akun DTO Kemenkes, lalu isi dengan format berikut:
    ```bash
    PORT=3000
    CLIENT_ID=isi_dengan_client_id_sandbox
    CLIENT_SECRET=isi_dengan_client_secret_sandbox
    AUTH_URL=https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1
    BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1
    ```
4. Jalankan server:
    ```bash
    node index.js
    ```

## Alur Pengerjaan (Progress)
- [x] Inisialisasi project dan repositori GitHub
- [ ] Mendapatkan `Access Token`
- [ ] Pencarian data referensi (IHS pasien dan dokter)
- [ ] Persiapan lokasi (`POST Location`)
- [ ] Pendaftaran kunjungan (`POST Encounter`)