# SATUSEHAT FHIR Integration Dashboard - Frontend

A modern Next.js-based dashboard for managing healthcare data integrated with Indonesia's SATUSEHAT FHIR proxy.

## 📋 Project Structure

```
fe/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home redirect
│   │   ├── globals.css              # Global styles
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   └── dashboard/
│   │       └── page.tsx             # Dashboard main page
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx  # Main dashboard layout with sidebar
│   │   ├── modules/
│   │   │   ├── Patient.tsx          # Patient management module
│   │   │   ├── Practitioner.tsx     # Practitioner module (stub)
│   │   │   ├── Location.tsx         # Location module (stub)
│   │   │   └── Encounter.tsx        # Encounter module (stub)
│   │   └── common/
│   │       ├── Toast.tsx            # Toast notification component
│   │       ├── Loader.tsx           # Loading skeletons
│   │       └── PatientForm.tsx      # Patient creation modal
│   ├── hooks/
│   │   └── index.ts                 # Custom hooks (useFetch, useToast)
│   ├── lib/
│   │   ├── apiClient.ts             # Axios instance with interceptors
│   │   └── api.ts                   # FHIR API functions
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── .env.local                       # Environment variables
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend running at `http://localhost:3000`

### Installation

1. **Install dependencies:**
   ```bash
   cd fe
   npm install
   ```

2. **Configure environment:**
   The `.env.local` file is already configured:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Architecture

### 2-Page Model
- **`/login`**: Authentication gate for user login
- **`/dashboard`**: Main application with conditional rendering (no URL changes)

### Dashboard Layout
- **Sidebar Navigation**: 4 main modules with collapsible menu
  - Pasien (Patient)
  - Praktisi (Practitioner)
  - Lokasi (Location)
  - Kunjungan (Encounter)
- **Main Content Area**: Dynamic module rendering

## 🔑 Key Features

### Patient Module
- **Search by NIK**: Input 16-digit NIK, automatically prepends FHIR identifier
- **Patient Creation**: Modal form to add new patients
- **Data Table**: Display search results with formatted information
- **State Management**: Loading, Success, Error states with visual feedback
- **Input Validation**: Client-side validation for NIK format

### API Integration
- **Axios Client**: With request/response interceptors
- **Error Handling**: FHIR OperationOutcome error extraction
- **Auto Token Management**: Stores and attaches auth token to requests
- **Timeout Handling**: 15-second request timeout

### UI/UX Components
- **Toast Notifications**: Success, error, and info messages
- **Loading Skeletons**: Table and card skeleton loaders
- **Responsive Design**: Mobile-friendly layouts
- **Tailwind CSS**: Utility-first styling

## 📡 API Endpoints

The frontend communicates with the backend at `http://localhost:3000`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/test-auth` | GET | Test authentication token |
| `/api/fhir/patient` | GET | Search patients |
| `/api/fhir/patient` | POST | Create new patient |
| `/api/fhir/practitioner` | GET | Search practitioners |
| `/api/fhir/practitioner` | POST | Create new practitioner |
| `/api/fhir/location` | GET | Search locations |
| `/api/fhir/location` | POST | Create new location |
| `/api/fhir/encounter` | POST | Create new encounter |

## 🛠️ Customization

### Adding New Modules
1. Create component in `components/modules/`
2. Export from the module file
3. Import in `dashboard/page.tsx`
4. Add to module list in `DashboardLayout.tsx`

### Styling
- Global styles in `app/globals.css`
- Component-level styles via Tailwind classes
- Animations defined in `globals.css`

### API Configuration
- Update `NEXT_PUBLIC_API_URL` in `.env.local`
- Modify API client config in `lib/apiClient.ts`

## 🔐 Authentication

- Simple username/password login (demo implementation)
- Token stored in localStorage
- Auto-logout on 401 response
- Protected dashboard route

## 📝 Type Definitions

All FHIR types, API responses, and UI state are defined in `types/index.ts`:
- `FHIRPatient`, `FHIRPractitioner`, `FHIRLocation`, `FHIREncounter`
- `FHIRBundle`, `FHIROperationOutcome`
- `APIResponse`, `LoadingState`, `ToastNotification`

## 🐛 Troubleshooting

**Backend connection errors:**
- Ensure backend is running at `http://localhost:3000`
- Check `.env.local` for correct API URL
- Verify CORS settings on backend

**TypeScript errors:**
- Run `npm install` to ensure all types are installed
- Check that tsconfig.json paths are correct

**Module not found errors:**
- Verify file paths in imports
- Ensure all files are created in correct directories

## 📦 Dependencies

- **next**: 16.2.6 - React framework with SSR
- **react**: 19.2.4 - UI library
- **tailwindcss**: ^4 - CSS utility framework
- **axios**: ^1.6.0 - HTTP client
- **lucide-react**: ^0.263.1 - Icon library
- **typescript**: ^5 - Type safety

## 🎯 Next Steps

1. **Implement Practitioner Module**: Add search and creation forms
2. **Implement Location Module**: Add location management features
3. **Implement Encounter Module**: Add medical visit recording
4. **Add Authentication**: Integrate with real auth system
5. **Error Boundaries**: Add error handling for better UX
6. **Unit Tests**: Add test coverage with Jest

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [FHIR Specification](https://www.hl7.org/fhir/)
- [Axios Documentation](https://axios-http.com/)

