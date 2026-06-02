# SATUSEHAT MVP Frontend - Setup & Implementation Guide

## 📖 Overview

This document provides a complete guide to the SATUSEHAT MVP Dashboard implementation, including architecture decisions, component structure, and usage patterns.

## 🏗️ Architecture Overview

### Design Pattern: 2-Page SPA Model

```
┌─────────────────────────────────────┐
│          Root (/)                   │
│  - Redirects to /login or           │
│    /dashboard based on auth         │
└─────────────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌──────────┐
│ Login  │  │ Dashboard│
│ Route  │  │  Route   │
└────────┘  └──────────┘
                │
         ┌──────┴──────┐
         │              │
    ┌────▼────┐  ┌─────▼──────┐
    │ Sidebar │  │ Main Content│
    │ (Fixed) │  │ (Dynamic)   │
    └─────────┘  └─────────────┘
```

**Key Design Decisions:**
1. **No URL Changes**: Module navigation happens via state, not routing
2. **Persistent Sidebar**: Always visible, collapses on mobile
3. **Lazy Loading**: Each module renders only when selected
4. **Centralized State**: Dashboard page manages active module

### Component Hierarchy

```
App (Root Layout)
├── Login Page
│   ├── Form (Username/Password)
│   ├── Error Display
│   └── Toast Notifications
│
└── Dashboard Page
    ├── DashboardLayout (Layout Provider)
    │   ├── Sidebar
    │   │   ├── Logo
    │   │   ├── Module Buttons
    │   │   └── Logout Button
    │   │
    │   └── Main Content Area
    │       ├── Patient Module (Active)
    │       │   ├── Search Bar
    │       │   ├── Add Patient Button
    │       │   ├── Data Table
    │       │   ├── PatientForm Modal
    │       │   └── Toast Container
    │       │
    │       ├── Practitioner Module (Stub)
    │       ├── Location Module (Stub)
    │       └── Encounter Module (Stub)
```

## 🔄 Patient Module Workflow

### Search Flow

```
User Input (NIK) → Validation (16 digits) → API Call
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                Loading State          Success State             Error State
              (Skeleton Loader)      (Data Table)          (Toast Error)
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                    Display Results or Empty
```

### Key Implementation Details

**NIK Search Logic:**
```typescript
// Input: "1234567890123456" (user types in UI)
// ↓ Validation: Must be exactly 16 digits
// ↓ API Call: 
GET /api/fhir/patient?identifier=https://fhir.kemkes.go.id/id/nik|1234567890123456
// ↓ Response: FHIR Bundle with matching patients
// ↓ Render: Data table with formatted results
```

**Important Features:**
1. **Input Sanitization**: Only digits allowed, max 16 characters
2. **Automatic Identifier Assembly**: Frontend constructs FHIR identifier format
3. **User Safety**: Users cannot input raw FHIR identifiers
4. **Error Handling**: FHIR OperationOutcome errors mapped to user-friendly messages

## 📦 Hooks & Utilities

### `useFetch` Hook

Manages loading, error, and execution states for async operations.

```typescript
const { isLoading, error, execute } = useFetch();

// Usage
await execute(async () => {
  return await patientAPI.searchByNIK(nik);
});
```

**States:**
- `isLoading`: true during request
- `error`: Error message if request fails
- `execute`: Function to run async operation

### `useToast` Hook

Manages toast notifications with auto-dismiss.

```typescript
const { toasts, addToast, removeToast } = useToast();

// Usage
addToast('Patient found!', 'success', 3000);
addToast('Error occurred', 'error', 5000);
addToast('Info message', 'info', 4000);
```

**Toast Types:**
- `success`: Green background
- `error`: Red background
- `info`: Blue background

## 🛠️ Customization Guide

### Adding a New Module

1. **Create Component** (`components/modules/NewModule.tsx`):
```typescript
'use client';

export const NewModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Module Title</h2>
      {/* Content */}
    </div>
  );
};
```

2. **Import in Dashboard**:
```typescript
import { NewModule } from '@/components/modules/NewModule';

const renderModule = () => {
  switch (activeModule) {
    case 'newmodule':
      return <NewModule />;
    // ... other cases
  }
};
```

3. **Add to Sidebar** (`DashboardLayout.tsx`):
```typescript
const modules: DashboardModule[] = [
  // ... existing modules
  { id: 'newmodule', label: 'New Module', icon: <Icon size={20} /> },
];
```

### Customizing Colors

All colors use Tailwind classes. Update in component files:

```typescript
// Blue buttons
className="bg-blue-600 hover:bg-blue-700"

// Red errors
className="bg-red-500 text-white"

// Green success
className="bg-green-500 text-white"
```

### Adding Authentication Provider

For production, integrate with real auth system:

```typescript
// lib/auth.ts
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    const { token } = response.data;
    localStorage.setItem('authToken', token);
    return token;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },
};
```

## 🔐 Security Considerations

### Current Implementation
- **localStorage** for token storage (for demo)
- **Axios interceptors** for auto-attaching token
- **httpOnly cookies** recommended for production

### Recommendations for Production
1. Use **httpOnly cookies** instead of localStorage
2. Implement **CSRF protection**
3. Add **rate limiting** on client
4. Validate all inputs server-side
5. Implement **session timeout**
6. Use **HTTPS** only

## 🚀 Deployment

### Environment Variables

Create `.env.local` for development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Create `.env.production` for production:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Building

```bash
npm run build
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Performance Optimization

### Implemented
- ✅ Code splitting by module
- ✅ Image optimization via Next.js
- ✅ CSS minification with Tailwind
- ✅ Request timeout (15 seconds)

### Recommendations
- 🔲 Add SWR for client-side caching
- 🔲 Implement pagination for large datasets
- 🔲 Add service worker for offline support
- 🔲 Optimize bundle with dynamic imports

## 🧪 Testing

### Unit Tests (Recommended)
```typescript
// __tests__/Patient.test.ts
import { render, screen } from '@testing-library/react';
import { PatientModule } from '@/components/modules/Patient';

describe('PatientModule', () => {
  it('should render search bar', () => {
    render(<PatientModule />);
    expect(screen.getByPlaceholderText(/Masukkan NIK/i)).toBeInTheDocument();
  });
});
```

### Integration Tests
- Test API integration with mock backend
- Verify FHIR data transformation
- Test error handling

## 📚 API Integration Details

### Request/Response Cycle

1. **Request Interceptor** (apiClient.ts):
   - Attaches auth token from localStorage
   - Sets Content-Type header

2. **Response Interceptor**:
   - Checks for 401 status
   - Auto-redirects to login if unauthorized
   - Passes through successful responses

3. **Error Extraction** (api.ts):
   - `extractFHIRErrorMessage()` parses OperationOutcome
   - Transforms FHIR errors to user-friendly messages

### Example Error Response Handling

```typescript
// From backend
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found",
    "diagnostics": "Patient not found"
  }]
}

// Converted to
"Patient not found" → Toast notification
```

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Backend connection fails | Backend not running | Start backend: `npm run dev` in `be/` |
| 401 errors on requests | Invalid token | Clear localStorage, login again |
| API URL not found | Wrong env config | Check `.env.local` has correct URL |
| Styles not loading | Tailwind not built | Run `npm install`, restart dev server |
| NIK search returns nothing | Invalid NIK format | Ensure exactly 16 digits |

## 📞 Support & Troubleshooting

### Check Development Setup
```bash
# Backend health
curl http://localhost:3000/api/auth/test-auth

# Frontend running
curl http://localhost:3001

# Environment variables
cat .env.local
```

### Debug Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (search, create)
4. Check request/response payloads
5. Verify headers include Authorization

## 🎯 Next Development Phases

### Phase 2: Practitioner Module
- [ ] Search practitioners by name
- [ ] Create new practitioner form
- [ ] Display practitioner qualifications

### Phase 3: Location Module
- [ ] Search medical locations
- [ ] Create new location
- [ ] Map integration (optional)

### Phase 4: Encounter Module
- [ ] Record medical visits
- [ ] Link to patient, practitioner, location
- [ ] Visit history timeline

### Phase 5: Enhancement
- [ ] Advanced search filters
- [ ] Data export (PDF, Excel)
- [ ] Audit logging
- [ ] Multi-language support

