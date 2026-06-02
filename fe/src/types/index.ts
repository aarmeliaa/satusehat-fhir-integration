// FHIR Resource Types
export interface FHIRIdentifier {
  system?: string;
  value?: string;
}

export interface FHIRHumanName {
  use?: string;
  family?: string;
  given?: string[];
}

export interface FHIRContactPoint {
  system?: string;
  value?: string;
}

export interface FHIRAddress {
  use?: string;
  street?: string[];
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface FHIRPatient {
  resourceType: string;
  id: string;
  identifier?: FHIRIdentifier[];
  name?: FHIRHumanName[];
  gender?: string;
  birthDate?: string;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
  maritalStatus?: {
    text?: string;
  };
}

export interface FHIRPractitioner {
  resourceType: string;
  id: string;
  identifier?: FHIRIdentifier[];
  name?: FHIRHumanName[];
  qualification?: Array<{
    code?: {
      text?: string;
    };
  }>;
}

export interface FHIRLocation {
  resourceType: string;
  id: string;
  identifier?: FHIRIdentifier[];
  name?: string;
  status?: string;
  physicalType?: {
    text?: string;
  };
}

export interface FHIREncounter {
  resourceType: string;
  id: string;
  status?: string;
  subject?: {
    reference: string;
  };
  participant?: Array<{
    individual: {
      reference: string;
    };
  }>;
  location?: Array<{
    location: {
      reference: string;
    };
  }>;
}

export interface FHIRBundle {
  resourceType: string;
  type: string;
  total: number;
  entry: Array<{
    resource: FHIRPatient | FHIRPractitioner | FHIRLocation | FHIREncounter;
  }>;
}

export interface FHIROperationOutcome {
  resourceType: string;
  issue: Array<{
    severity: string;
    code: string;
    diagnostics?: string;
    details?: {
      text?: string;
    };
  }>;
}

// API Response Types
export interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  message?: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface DashboardModule {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface PatientSearchParams {
  nik: string;
}
