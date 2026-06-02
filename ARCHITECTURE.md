# SATUSEHAT MVP - Project File Tree & Architecture

## 📂 Complete File Structure

```
satusehat-fhir-integration/
│
├── be/                                    # Backend (existing)
│   ├── package.json
│   ├── index.js
│   ├── swagger.json
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── services/
│
├── fe/                                    # Frontend (NEW - MVP Implementation)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # 📄 Root layout with metadata
│   │   │   ├── page.tsx                   # 📄 Auto-redirect logic
│   │   │   ├── globals.css                # 📄 Global styles + animations
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx               # 📄 Login page (auth gate)
│   │   │   │
│   │   │   └── dashboard/
│   │   │       └── page.tsx               # 📄 Dashboard with module routing
│   │   │
│   │   ├── components/                    # UI Components Layer
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.tsx    # 📄 Sidebar + Main content layout
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── Patient.tsx            # 📄 ✨ Patient module (fully implemented)
│   │   │   │   ├── Practitioner.tsx       # 📄 Practitioner module (stub)
│   │   │   │   ├── Location.tsx           # 📄 Location module (stub)
│   │   │   │   └── Encounter.tsx          # 📄 Encounter module (stub)
│   │   │   │
│   │   │   └── common/
│   │   │       ├── Toast.tsx              # 📄 Toast notifications
│   │   │       ├── Loader.tsx             # 📄 Skeleton loaders
│   │   │       └── PatientForm.tsx        # 📄 Patient creation modal
│   │   │
│   │   ├── hooks/
│   │   │   └── index.ts                   # 📄 useFetch, useToast hooks
│   │   │
│   │   ├── lib/
│   │   │   ├── apiClient.ts               # 📄 Axios instance + interceptors
│   │   │   └── api.ts                     # 📄 FHIR API functions
│   │   │
│   │   └── types/
│   │       └── index.ts                   # 📄 TypeScript definitions
│   │
│   ├── public/                            # Static assets
│   ├── node_modules/                      # Dependencies
│   ├── .env.local                         # 📄 Environment variables
│   ├── package.json                       # 📄 Dependencies with axios, lucide-react
│   ├── tsconfig.json                      # TypeScript config
│   ├── next.config.ts                     # Next.js config
│   ├── tailwind.config.ts                 # Tailwind config
│   ├── FRONTEND_README.md                 # 📄 Frontend setup guide
│   └── README.md                          # Original readme
│
├── MVP_SUMMARY.md                         # 📄 Complete implementation summary
├── IMPLEMENTATION_GUIDE.md                # 📄 Architecture & customization guide
└── README.md                              # Original project readme
```

## 🏗️ Component Architecture

### Page Structure (Routing)

```
Next.js Pages (App Router)
├── / (Root)
│   └── Redirect to /login or /dashboard based on auth token
│
├── /login
│   └── LoginPage
│       ├── Form (Username/Password)
│       ├── Error Display
│       ├── Submit Button
│       └── Backend URL info
│
└── /dashboard
    └── DashboardPage (State Manager)
        ├── useEffect: Check auth, redirect if not authenticated
        ├── State: activeModule (patient|practitioner|location|encounter)
        ├── useRouter: Handle logout
        │
        └── DashboardLayout (Presenter)
            ├── Sidebar
            │   ├── Logo/Title
            │   ├── Collapse Toggle Button
            │   ├── Module Navigation Buttons
            │   │   ├── Pasien (Patient)
            │   │   ├── Praktisi (Practitioner)
            │   │   ├── Lokasi (Location)
            │   │   └── Kunjungan (Encounter)
            │   └── Logout Button
            │
            └── Main Content Area
                ├── PatientModule (if activeModule === 'patient')
                │   ├── Header (Title + Add Button)
                │   ├── Search Bar
                │   │   ├── NIK Input (16 digits only)
                │   │   └── Search Button
                │   ├── Conditional Rendering
                │   │   ├── Loading: TableSkeleton
                │   │   ├── Success: Results Table
                │   │   ├── Error: Error Message Box
                │   │   └── Empty: Empty State Message
                │   ├── PatientForm Modal (for POST requests)
                │   │   ├── Modal Overlay
                │   │   ├── Form Fields
                │   │   ├── Submit/Cancel Buttons
                │   │   └── Loading State
                │   └── Toast Container
                │
                ├── PractitionerModule (stub)
                ├── LocationModule (stub)
                └── EncounterModule (stub)
```

## 📡 Data Flow Architecture

### Patient Search Flow (Complete)

```
UI Component Layer
│
┌─────────────────────────────────────────────────────┐
│  PatientModule.tsx                                  │
│  ├── State: searchNIK, patients, hasSearched        │
│  ├── Hooks: useFetch, useToast                      │
│  └── Event: handleSearch()                          │
└──────────────────┬──────────────────────────────────┘
                   │ NIK input + validate
                   ▼
┌─────────────────────────────────────────────────────┐
│  Validation Layer                                   │
│  ├── Test: /^\d{16}$/.test(nik)                    │
│  ├── Trim whitespace                                │
│  └── Max 16 characters, digits only                 │
└──────────────────┬──────────────────────────────────┘
                   │ Valid NIK
                   ▼
┌─────────────────────────────────────────────────────┐
│  API Layer (lib/api.ts)                             │
│  ├── patientAPI.searchByNIK(nik)                    │
│  ├── Construct identifier:                          │
│  │   `https://fhir.kemkes.go.id/id/nik|${nik}`    │
│  └── Call: GET /api/fhir/patient?identifier=...   │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP Request
                   ▼
┌─────────────────────────────────────────────────────┐
│  Axios Client (lib/apiClient.ts)                    │
│  ├── Request Interceptor:                           │
│  │   └── Attach auth token from localStorage       │
│  ├── HTTP Call to backend                           │
│  └── Response Interceptor:                          │
│      ├── Check 401 → redirect to login              │
│      └── Return response or throw error             │
└──────────────────┬──────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼ Success         ▼ Error
     ┌─────────┐       ┌────────────┐
     │ FHIRBundle    │ AxiosError
     └────┬────┘       └──────┬─────┘
          │                   │
          ▼                   ▼
    ┌──────────────┐    ┌──────────────────┐
    │ Set patients │    │ extractFHIRError │
    │ Show table   │    │ Message to toast │
    └──────────────┘    └──────────────────┘
          │                   │
          └───────┬───────────┘
                  ▼
         ┌──────────────────┐
         │ UI Re-renders    │
         │ with results     │
         └──────────────────┘
```

### Form Submission Flow (Patient Creation)

```
User clicks "Tambah Pasien"
        │
        ▼
setShowForm(true)
        │
        ▼
PatientForm Modal appears
        │
        ▼
User fills form:
├── NIK
├── Given Name
├── Family Name
├── Gender
└── Birth Date
        │
        ▼
handleSubmit(e)
        │
        ▼
Construct patientPayload
├── resourceType: "Patient"
├── name: [{use, given, family}]
├── gender
├── birthDate
└── identifier: [{system, value}]
        │
        ▼
executeForm(async () => {
    await patientAPI.create(payload)
})
        │
        ├─ setLoading(true) → Show "Menyimpan..."
        │
        ▼
POST /api/fhir/patient
        │
        ├─ Success: 
        │   ├─ Update patients list
        │   ├─ Close modal
        │   ├─ Show success toast
        │   └─ Clear form
        │
        └─ Error:
            ├─ Show error toast
            └─ Keep modal open (allow retry)
```

## 🔌 API Integration Points

### Request/Response Lifecycle

```
Component
   │
   ├─ API Function (lib/api.ts)
   │  ├─ Validate input
   │  ├─ Format payload
   │  └─ Call apiClient
   │
   └─→ Axios Instance (lib/apiClient.ts)
       ├─ Request Interceptor
       │  ├─ Get token from localStorage
       │  ├─ Set header: "Authorization: Bearer {token}"
       │  └─ Set timeout: 15s
       │
       ├─→ HTTP Request to Backend
       │
       ├─ Response Interceptor
       │  ├─ Check status code
       │  ├─ If 401: Remove token, redirect to /login
       │  ├─ Else: Return response data
       │  └─ Handle network timeout
       │
       └─ Error Handling
          ├─ Network error
          ├─ Response error (4xx, 5xx)
          └─ Throw to component
```

## 🎯 Module Implementation Pattern

All modules follow this structure for consistency:

```typescript
'use client';

import React, { useState } from 'react';
import { [Icons] } from 'lucide-react';
import { [Types] } from '@/types';
import { [API] } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';
import { [Components] } from '@/components/common';

export const [ModuleName]Module: React.FC = () => {
  // State management
  const [data, setData] = useState<[Type][]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Custom hooks
  const { isLoading, error, execute } = useFetch();
  const { toasts, addToast, removeToast } = useToast();
  
  // Handlers
  const handleSearch = async () => { /* ... */ };
  const handleCreate = async (formData) => { /* ... */ };
  
  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Search/Filter */}
      {/* Data Display */}
      {/* Modal */}
      {/* Toast Container */}
    </div>
  );
};
```

## 🔐 Authentication Flow

```
User visits /
        │
        ▼
Check localStorage for authToken
        │
   ├─ Token exists
   │  └─→ Redirect to /dashboard
   │
   └─ No token
      └─→ Redirect to /login
            │
            ▼
      User enters credentials
            │
            ▼
      handleSubmit()
            │
            ├─→ authAPI.testAuth()
            │
            ├─ Success:
            │  ├─ Store token in localStorage
            │  ├─ Store username in localStorage
            │  └─ Navigate to /dashboard
            │
            └─ Error:
               └─ Show error toast
                  └─ Keep on login page
```

## 🎨 Styling Architecture

### Tailwind CSS Organization

```
Base Styles (globals.css)
├── CSS variables
├── Theme configuration
└── Custom animations

Component Styles (inline classes)
├── Layout utilities
│  ├── flex, grid
│  ├── padding, margin
│  └── responsive (sm:, md:, lg:)
│
├── Color utilities
│  ├── bg-blue-600
│  ├── text-white
│  └── hover:bg-blue-700
│
├── Effects
│  ├── shadow-lg
│  ├── rounded-lg
│  ├── border
│  └── opacity, transitions
│
└── States
   ├── hover:
   ├── disabled:
   ├── focus:
   └── animate-
```

### Color Scheme

```
Primary: Blue (#2563eb)
├── Backgrounds: bg-blue-600, bg-blue-700
├── Hover: hover:bg-blue-700
└── Sidebar: from-blue-600 to-blue-800

Success: Green (#16a34a)
├── Background: bg-green-500
└── Toast: bg-green-500 text-white

Error: Red (#dc2626)
├── Background: bg-red-500
├── Toast: bg-red-500 text-white
└── Error boxes: bg-red-50 border-red-200

Info: Blue (#3b82f6)
├── Toast: bg-blue-500 text-white
└── Info boxes: bg-blue-50 border-blue-200

Neutral: Gray
├── Text: text-gray-600, text-gray-800
├── Backgrounds: bg-gray-50, bg-gray-100
└── Borders: border-gray-200, border-gray-300
```

## 🧩 Hook Implementation Details

### useFetch Hook

```typescript
export const useFetch = () => {
  const [loading, setLoading] = useState({
    isLoading: false,
    error: null
  });
  
  const execute = async (fetchFn, onSuccess) => {
    setLoading({ isLoading: true, error: null });
    try {
      const result = await fetchFn();
      setLoading({ isLoading: false, error: null });
      onSuccess?.(result);
      return { data: result };
    } catch (err) {
      setLoading({ isLoading: false, error: err.message });
      return { error: err.message };
    }
  };
  
  return { ...loading, execute };
};
```

State transitions:
```
Initial: isLoading=false, error=null
   │
   ├─ Call execute()
   │  └─ Set: isLoading=true, error=null
   │
   ├─ API succeeds
   │  └─ Set: isLoading=false, error=null
   │     └─ Call onSuccess callback
   │
   └─ API fails
      └─ Set: isLoading=false, error=message
```

### useToast Hook

```typescript
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  const addToast = (message, type, duration = 3000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    
    return id;
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return { toasts, addToast, removeToast };
};
```

Toast lifecycle:
```
User action
   │
   └─ addToast('Message', 'success', 3000)
      │
      ├─ Create toast object with unique ID
      ├─ Add to toasts array
      ├─ Toast appears in UI
      │
      └─ After 3000ms
         └─ removeToast(id)
            └─ Remove from array
               └─ Toast disappears
```

## 📊 Type Definition Relationships

```
FHIRBundle
├── entry[]
│   └── resource
│       ├── FHIRPatient
│       ├── FHIRPractitioner
│       ├── FHIRLocation
│       └── FHIREncounter

FHIRPatient
├── identifier[]
│   ├── system: "https://fhir.kemkes.go.id/id/nik"
│   └── value: "1234567890123456"
├── name[]
│   ├── family: "Doe"
│   └── given: ["John"]
├── gender: "male|female|other"
├── birthDate: "YYYY-MM-DD"
└── telecom[]

FHIROperationOutcome
└── issue[]
    ├── severity: "error|warning|info"
    ├── code: "not-found|invalid|..."
    ├── diagnostics: "Error message"
    └── details
        └── text: "Additional info"
```

---

This document provides a complete visual guide to the MVP architecture, data flows, and component relationships.

