# 🏥 Panduan Testing API SATUSEHAT (BFF Backend) dengan Postman

> **Environment:** SATUSEHAT Staging (`api-satusehat-stg.dto.kemkes.go.id`)  
> **Backend Base URL:** `http://localhost:8000`  
> **Tujuan:** Melakukan simulasi alur klinis 5 tahap hingga berhasil mendaftarkan Kunjungan Medis (Encounter) dan mendapatkan respons **201 Created**.

Panduan ini dibuat agar tim bisa langsung mencoba dan mengetes integrasi SATUSEHAT dengan mudah.

---

## ⚠️ Persiapan Penting Sebelum Mulai

**Aturan Integrasi SATUSEHAT:**
Pastikan `CLIENT_ID`, `CLIENT_SECRET`, dan `Organization ID (UUID)` yang kamu gunakan **berasal dari satu akun yang sama** di portal [SATUSEHAT Platform (SSP)](https://satusehat.kemkes.go.id/platform). Mencampur kredensial dari akun yang berbeda akan menyebabkan error.

### 1. Jalankan Backend Server
Buka terminal, masuk ke folder `be`, dan jalankan:
```bash
npm install
npm start
```

### 2. Setup Environment di Postman
Di Postman, buat *Environment* baru (misalnya "SATUSEHAT Staging") dan tambahkan variabel berikut:

| Variable | Isi / Nilai (Value) | Keterangan |
|---|---|---|
| `BASE_URL` | `http://localhost:8000` | URL lokal backend kita |
| `ORG_ID` | *UUID Organisasi Kamu* | Dapatkan dari portal SSP (contoh: `f0930057-...`) |
| `PATIENT_IHS` | `P02478375538` | ID Pasien Dummy (Ardianto Putra) |
| `PRACTITIONER_IHS` | `10009880728` | ID Dokter Dummy (dr. Alexander) |
| `LOCATION_ID` | *(kosongkan dulu)* | Akan otomatis terisi di Tahap 4 |

Pastikan kamu telah **memilih environment ini** di pojok kanan atas Postman sebelum mulai.

---

## 📋 Data Dummy Resmi Kemenkes (Staging)

Di environment Staging, NIK asli (KTP kita) **tidak akan ditemukan**. Kamu wajib menggunakan NIK atau IHS Number dummy resmi dari Kemenkes di bawah ini untuk testing:

| NIK | Nama | **IHS Number (ID)** | Peran |
|---|---|---|---|
| `9271060312000001` | Ardianto Putra | **P02478375538** | Pasien (Patient) |
| `7209061211900001` | dr. Alexander | **10009880728** | Dokter (Practitioner) |

*(Nilai IHS Number ini sudah kita masukkan ke variabel Postman di langkah persiapan tadi).*

---

## 🚀 Alur Tes 5 Tahap (Clinical Flow)

### Tahap 1 — Verifikasi Autentikasi
Kita pastikan backend bisa terhubung dan mendapatkan token dari SATUSEHAT.

- **Method:** `GET`
- **URL:** `{{BASE_URL}}/api/auth/test-auth`

**Ekspektasi Respons (200 OK):**
```json
{
    "success": true,
    "message": "Berhasil mendapatkan token",
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6..."
}
```

---

### Tahap 2 — Cari Pasien (Patient)
*(Opsional: Karena kita sudah set `PATIENT_IHS` di variabel, tahap ini bisa dilewati. Tapi ini cara kerjanya jika mencari lewat NIK).*

- **Method:** `GET`
- **URL:** `{{BASE_URL}}/api/fhir/patient?nik=9271060312000001`

**Ekspektasi Respons (200 OK):** Kamu akan melihat data pasien Ardianto Putra dengan ID `P02478375538`.

---

### Tahap 3 — Cari Dokter (Practitioner)
*(Opsional: Sama seperti tahap 2, kita sudah punya ID-nya).*

- **Method:** `GET`
- **URL:** `{{BASE_URL}}/api/fhir/practitioner?nik=7209061211900001`

**Ekspektasi Respons (200 OK):** Kamu akan melihat data dr. Alexander dengan ID `10009880728`.

---

### Tahap 4 — Daftarkan Ruangan (Location)
Kita mendaftarkan ruangan klinik (misal: Poli Umum) ke SATUSEHAT. ID Ruangan ini nantinya wajib disertakan saat mendaftarkan kunjungan pasien.

- **Method:** `POST`
- **URL:** `{{BASE_URL}}/api/fhir/location`
- **Headers:** `Content-Type: application/json`

**Body (JSON):**
```json
{
    "resourceType": "Location",
    "status": "active",
    "name": "Poli Umum",
    "description": "Ruang pelayanan poli umum",
    "mode": "instance",
    "physicalType": {
        "coding": [
            {
                "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
                "code": "ro",
                "display": "Room"
            }
        ]
    },
    "managingOrganization": {
        "reference": "Organization/{{ORG_ID}}"
    }
}
```

**Ekspektasi Respons (201 Created):**
```json
{
    "success": true,
    "data": {
        "resourceType": "Location",
        "id": "4079d4e0-bf66-43f7-96b4-8e814a654511",
        "name": "Poli Umum",
        ...
    }
}
```
**TINDAKAN PENTING:** Copy nilai `"id"` dari respons di atas (misal: `4079d4e0-...`), lalu masukkan ke dalam variabel `LOCATION_ID` di Environment Postman kamu.

---

### Tahap 5 — Daftarkan Kunjungan Medis (Encounter) 🎉
Ini adalah tahap akhir. Kita akan menggabungkan data Pasien, Dokter, dan Ruangan untuk mendaftarkan kunjungan pasien.

- **Method:** `POST`
- **URL:** `{{BASE_URL}}/api/fhir/encounter`
- **Headers:** `Content-Type: application/json`

**Body (JSON):**
*(Tinggal Copy-Paste, Postman akan otomatis mengambil ID dari environment variables)*

```json
{
    "resourceType": "Encounter",
    "identifier": [
        {
            "system": "http://sys-ids.kemkes.go.id/encounter/{{ORG_ID}}",
            "value": "enc-001"
        }
    ],
    "status": "arrived",
    "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "AMB",
        "display": "ambulatory"
    },
    "subject": {
        "reference": "Patient/{{PATIENT_IHS}}",
        "display": "Ardianto Putra"
    },
    "participant": [
        {
            "type": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                            "code": "ATND",
                            "display": "attender"
                        }
                    ]
                }
            ],
            "individual": {
                "reference": "Practitioner/{{PRACTITIONER_IHS}}",
                "display": "dr. Alexander"
            }
        }
    ],
    "period": {
        "start": "2024-06-03T08:00:00+07:00"
    },
    "location": [
        {
            "location": {
                "reference": "Location/{{LOCATION_ID}}",
                "display": "Poli Umum"
            }
        }
    ],
    "statusHistory": [
        {
            "status": "arrived",
            "period": {
                "start": "2024-06-03T08:00:00+07:00"
            }
        }
    ],
    "serviceProvider": {
        "reference": "Organization/{{ORG_ID}}"
    }
}
```

**Ekspektasi Respons (201 Created) 🏆:**
```json
{
    "success": true,
    "data": {
        "resourceType": "Encounter",
        "id": "45e2ca54-e36a-4247-853a-f54d33c40022",
        "status": "arrived",
        "subject": {
            "reference": "Patient/P02478375538",
            "display": "Ardianto Putra"
        },
        ...
    }
}
```
**Selamat! Integrasi SATUSEHAT telah berhasil!** 🚀

---

## ℹ️ Sekilas Info: Bagaimana BFF (Backend-for-Frontend) Kita Bekerja?

Frontend tidak perlu tahu kerumitan format URL FHIR SATUSEHAT. Backend kitalah yang menerjemahkannya secara otomatis.

**Contoh saat Frontend mencari pasien:**
- Frontend kirim: `GET /api/fhir/patient?nik=9271060312000001`
- Backend teruskan ke SATUSEHAT sebagai: `GET /Patient?identifier=https://fhir.kemkes.go.id/id/nik|9271060312000001`

Begitu juga dengan format error. Semua pesan error rumit dari SATUSEHAT akan ditangkap oleh backend dan dikembalikan ke frontend dalam format JSON yang bersih dan mudah dibaca:
```json
{
    "success": false,
    "message": "Pesan error bahasa Indonesia yang ramah pengguna"
}
```
