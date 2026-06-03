# 🏥 SATUSEHAT BFF Backend — Postman Testing Guide (v3)

> **Environment:** SATUSEHAT Staging (`api-satusehat-stg.dto.kemkes.go.id`)  
> **Backend Base URL:** `http://localhost:8000`  
> **Objective:** Walk through the 5-step clinical flow and capture a **201 Created** from the Encounter endpoint.

---

## ⚠️ Critical: Two Kinds of Organization ID in SATUSEHAT

This is the most common source of confusion. SATUSEHAT has **two different organization identifiers**:

| ID Type | Format | Used in | Where to find it |
|---|---|---|---|
| **UUID** (FHIR resource ID) | `f0930057-d5f7-4dd9-a0f6-465283102ad3` | `Location.managingOrganization` (lenient) | SSP portal → App detail |
| **Kode Faskes** (integer code) | `100059` or similar short number | `Encounter.serviceProvider` (strictly validated) | SSP portal → Organization profile |

SATUSEHAT's Rule 10124 (`wrong organization ID for serviceProvider`) fires when you use the **UUID** format in `Encounter.serviceProvider` — you must use the **Kode Faskes** integer instead.

**Step 2.5 below** shows how to discover your Kode Faskes using the new `/api/fhir/organization` endpoint.

---

## ⚠️ Understanding the Staging Environment

The SATUSEHAT Staging/Sandbox only contains dummy data from Kemenkes — your personal NIK will always return `total: 0`. Use the official dummy NIKs below.

---

## Official Kemenkes Dummy Data

### 👤 Dummy Patients

| NIK | Nama | IHS Number |
|---|---|---|
| `9271060312000001` | Ardianto Putra | **P02478375538** |
| `9204014804000002` | Claudia Sintia | **P03647103112** |
| `9104224509000003` | Elizabeth Dior | **P00805884304** |
| `9104224606000005` | Ghina Assyifa | **P01654557057** |
| `9210060207000010` | Syarif Muhammad | **P02428473601** |

### 👨‍⚕️ Dummy Practitioners

| NIK | Nama | IHS Number |
|---|---|---|
| `7209061211900001` | dr. Alexander | **10009880728** |
| `3322071302900002` | dr. Yoga Yandika, Sp.A. | **10006926841** |
| `3171071609900003` | dr. Syarifuddin, Sp.Pd. | **10001354453** |
| `3217040109800006` | dr. Olivia Kirana, Sp.OG. | **10002074224** |
| `3578083008700010` | apt. Aditya Pradhana, S.Farm. | **10001915884** |

---

## Prerequisites

### Start the backend

```bash
cd be
npm start   # or: npm run dev
```

### Postman Environment Variables

Create an environment named **SATUSEHAT Staging** with:

| Variable | Value | Notes |
|---|---|---|
| `BASE_URL` | `http://localhost:8000` | |
| `KODE_FASKES` | *(fill in Step 2.5)* | Integer Kode Faskes — for Encounter & Location |
| `PATIENT_IHS` | `P02478375538` | Pre-fill from dummy table above |
| `PRACTITIONER_IHS` | `10009880728` | Pre-fill from dummy table above |
| `LOCATION_ID` | *(fill in Step 4)* | UUID from Location POST response |

---

## Step 1 — Verify Authentication

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/auth/test-auth` |

**Expected:** `200 OK` with `"success": true` and a long JWT `accessToken`.

---

## Step 2 — Resolve Patient IHS (optional if you use dummy table)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/fhir/patient?nik=9271060312000001` |

**Expected:** `total: 1`, `entry[0].resource.id = "P02478375538"`

> **Shortcut:** Skip this. Just set `PATIENT_IHS = P02478375538` manually in your Postman env.

---

## Step 2.5 — Discover Your Kode Faskes ⭐ NEW — Do This Before Step 5

**Why:** SATUSEHAT Rule 10124 requires `Encounter.serviceProvider` to reference your **Kode Faskes** (integer code), not the UUID from the SSP portal. This new endpoint lets you find it.

### Request — List all organizations linked to your token

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/fhir/organization` |

No query params needed — returns all orgs accessible to your credentials.

### Alternative — Look up by your known UUID

```
GET {{BASE_URL}}/api/fhir/organization?_id=f0930057-d5f7-4dd9-a0f6-465283102ad3
```

Replace with the UUID you already have.

### Expected Response

```json
{
    "success": true,
    "data": {
        "resourceType": "Bundle",
        "total": 1,
        "entry": [
            {
                "resource": {
                    "resourceType": "Organization",
                    "id": "f0930057-d5f7-4dd9-a0f6-465283102ad3",
                    "identifier": [
                        {
                            "system": "http://sys-ids.kemkes.go.id/organization",
                            "value": "100059"
                        }
                    ],
                    "name": "Klinik Pratama ...",
                    "active": true
                }
            }
        ]
    }
}
```

### ⭐ Extract the Kode Faskes

Look inside `data.entry[0].resource.identifier`:

```
identifier[].system  →  "http://sys-ids.kemkes.go.id/organization"
identifier[].value   →  "100059"   ← THIS is your Kode Faskes
```

The `id` field (`f0930057-...`) is the UUID.  
The `identifier[].value` (`100059`) is the **Kode Faskes** you need for the Encounter.

**Save it:** Set Postman env variable `KODE_FASKES` = `100059` (your actual value).

> **If you get an empty Bundle:** SATUSEHAT may restrict listing all orgs. In that case, find your Kode Faskes in the [SSP portal](https://satusehat.kemkes.go.id/platform) under your application's organization profile — it's the short integer code next to the organization name.

---

## Step 3 — Resolve Practitioner IHS (optional if you use dummy table)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/fhir/practitioner?nik=7209061211900001` |

**Expected:** `total: 1`, `entry[0].resource.id = "10009880728"`

> **Shortcut:** Set `PRACTITIONER_IHS = 10009880728` manually.

---

## Step 4 — Create Location (Poli Umum)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/fhir/location` |
| **Header** | `Content-Type: application/json` |

### Request Body

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
        "reference": "Organization/{{KODE_FASKES}}"
    }
}
```

> Note: `managingOrganization` now uses `KODE_FASKES` (the integer) instead of the UUID.

**Expected:** `201 Created` — save `data.id` (a UUID) into `LOCATION_ID`.

---

## Step 5 — Create Encounter (Kunjungan Medis) 🎯

Two fixes applied vs. the previous guide:
1. **`identifier` field added** — mandatory per SATUSEHAT Rule 10117
2. **`serviceProvider` uses Kode Faskes** — not the UUID, per Rule 10124

### Request

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/fhir/encounter` |
| **Header** | `Content-Type: application/json` |

### ✅ Corrected Request Body — Template with Postman Variables

```json
{
    "resourceType": "Encounter",
    "identifier": [
        {
            "system": "http://sys-ids.kemkes.go.id/encounter/{{KODE_FASKES}}",
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
        "reference": "Organization/{{KODE_FASKES}}"
    }
}
```

### ✅ Concrete Example with IDs Filled In

Replace `YOUR_KODE_FASKES` and `YOUR_LOCATION_UUID` with your actual values:

```json
{
    "resourceType": "Encounter",
    "identifier": [
        {
            "system": "http://sys-ids.kemkes.go.id/encounter/YOUR_KODE_FASKES",
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
        "reference": "Patient/P02478375538",
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
                "reference": "Practitioner/10009880728",
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
                "reference": "Location/YOUR_LOCATION_UUID",
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
        "reference": "Organization/YOUR_KODE_FASKES"
    }
}
```

### 🏆 Expected Response — `201 Created`

```json
{
    "success": true,
    "data": {
        "resourceType": "Encounter",
        "id": "b4c29d7e-1a3f-4b8c-9e2d-5f6a7b8c9d0e",
        "status": "arrived",
        "subject": { "reference": "Patient/P02478375538" },
        "participant": [{ "individual": { "reference": "Practitioner/10009880728" } }],
        "location": [{ "location": { "reference": "Location/YOUR_LOCATION_UUID" } }]
    }
}
```

> **📸 Screenshot:** Capture the **`201 Created`** status badge (top-right) + the `"id"` in the response body.

---

## Quick-Start Checklist

- [ ] `npm start` the backend (restart if it was running — new endpoint added)
- [ ] Step 1: `GET /api/auth/test-auth` → `success: true`
- [ ] Manually set `PATIENT_IHS = P02478375538` in Postman env
- [ ] Manually set `PRACTITIONER_IHS = 10009880728` in Postman env
- [ ] **Step 2.5:** `GET /api/fhir/organization` → find `identifier[].value` → set `KODE_FASKES`
- [ ] Step 4: `POST /api/fhir/location` → copy `data.id` → set `LOCATION_ID`
- [ ] Step 5: `POST /api/fhir/encounter` with corrected payload → **201 Created** 🎉

---

## Troubleshooting

### ❌ `Encounter.identifier` missing (Rule 10117)

Add the `identifier` array to your Encounter payload. SATUSEHAT makes this mandatory:
```json
"identifier": [
    {
        "system": "http://sys-ids.kemkes.go.id/encounter/YOUR_KODE_FASKES",
        "value": "enc-001"
    }
]
```

The `value` can be any unique string identifying this encounter in your system.

### ❌ Wrong org ID for serviceProvider (Rule 10124)

You used the UUID (`f0930057-...`) instead of the **Kode Faskes** integer. Run Step 2.5 to find it, or check the SSP portal. The correct reference looks like `"Organization/100059"` not `"Organization/f0930057-..."`.

### ❌ `total: 0` on Patient/Practitioner search

You're using your personal NIK. Use the official dummy NIKs from the table above.

### ❌ `400 Invalid identifier system` on Location

The `identifier.system` in your Location payload contained a wrong/placeholder org ID. Use the corrected Step 4 payload which omits the `identifier` block on Location.

### ❌ `422 Unprocessable Entity` on Encounter

| Symptom | Fix |
|---|---|
| Patient ref wrong | Use the IHS number (e.g., `P02478375538`), not the NIK |
| Practitioner ref wrong | Use the IHS number (e.g., `10009880728`), not the NIK |
| Location ref wrong | Use the UUID from Step 4's `data.id` response |
| `period.start` missing | Required. Use `"2024-06-03T08:00:00+07:00"` |
| `class` missing | Required. Use `"code": "AMB"` |

---

## BFF Translation Reference

| Frontend sends | Backend forwards to SATUSEHAT |
|---|---|
| `GET /api/fhir/patient?nik=...` | `GET .../Patient?identifier=https://fhir.kemkes.go.id/id/nik\|...` |
| `GET /api/fhir/practitioner?nik=...` | `GET .../Practitioner?identifier=https://fhir.kemkes.go.id/id/nik\|...` |
| `GET /api/fhir/organization` | `GET .../Organization` (with token) |
| `GET /api/fhir/organization?_id=...` | `GET .../Organization?_id=...` |
| `POST /api/fhir/location` | `POST .../Location` |
| `POST /api/fhir/encounter` | `POST .../Encounter` |

---

*SATUSEHAT BFF MVP — Staging Environment | Node.js + Express + Axios | FHIR R4 v1*
