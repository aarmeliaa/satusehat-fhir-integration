import { apiClient } from './apiClient';
import {
  FHIRBundle,
  FHIRPatient,
  FHIRPractitioner,
  FHIRLocation,
  FHIREncounter,
} from '@/types';

// ─── BFF Response shape ───────────────────────────────────────────────────────
// All responses from our backend are wrapped: { success: true, data: <FHIR> }
// Error responses:                            { success: false, message: "...", details: [...] }

interface BFFResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Unwrap the BFF envelope and return the inner FHIR data. */
async function bffGet<T>(url: string, params?: Record<string, string>): Promise<T> {
  const response = await apiClient.get<BFFResponse<T>>(url, { params });
  return response.data.data;
}

async function bffPost<T>(url: string, body: unknown): Promise<T> {
  const response = await apiClient.post<BFFResponse<T>>(url, body);
  return response.data.data;
}

// ─── Patient API ──────────────────────────────────────────────────────────────
export const patientAPI = {
  /** Search by NIK. Backend translates NIK → FHIR identifier URI automatically. */
  searchByNIK: async (nik: string): Promise<FHIRBundle> => {
    if (!/^\d{16}$/.test(nik)) throw new Error('NIK harus tepat 16 digit angka');
    return bffGet<FHIRBundle>('/api/fhir/patient', { nik });
  },

  /** Search by name. */
  searchByName: async (name: string): Promise<FHIRBundle> => {
    return bffGet<FHIRBundle>('/api/fhir/patient', { name });
  },

  create: async (patientData: Partial<FHIRPatient>): Promise<FHIRPatient> => {
    return bffPost<FHIRPatient>('/api/fhir/patient', patientData);
  },
};

// ─── Practitioner API ─────────────────────────────────────────────────────────
export const practitionerAPI = {
  /** Search by NIK. */
  searchByNIK: async (nik: string): Promise<FHIRBundle> => {
    if (!/^\d{16}$/.test(nik)) throw new Error('NIK harus tepat 16 digit angka');
    return bffGet<FHIRBundle>('/api/fhir/practitioner', { nik });
  },

  /** Search by name (partial match). */
  searchByName: async (name: string): Promise<FHIRBundle> => {
    return bffGet<FHIRBundle>('/api/fhir/practitioner', { name });
  },

  create: async (data: Partial<FHIRPractitioner>): Promise<FHIRPractitioner> => {
    return bffPost<FHIRPractitioner>('/api/fhir/practitioner', data);
  },
};

// ─── Location API ─────────────────────────────────────────────────────────────
export const locationAPI = {
  /** Search by name. */
  searchByName: async (name: string): Promise<FHIRBundle> => {
    return bffGet<FHIRBundle>('/api/fhir/location', { name });
  },

  create: async (data: Partial<FHIRLocation>): Promise<FHIRLocation> => {
    return bffPost<FHIRLocation>('/api/fhir/location', data);
  },
};

// ─── Encounter API ────────────────────────────────────────────────────────────
export const encounterAPI = {
  create: async (data: Partial<FHIREncounter>): Promise<FHIREncounter> => {
    return bffPost<FHIREncounter>('/api/fhir/encounter', data);
  },
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  testAuth: async (): Promise<any> => {
    const response = await apiClient.get('/api/auth/test-auth');
    return response.data;
  },
};

// ─── Error helper ─────────────────────────────────────────────────────────────
/**
 * Extract a readable error message from the BFF standardized error format.
 * The BFF backend always returns: { success: false, message: "...", details: [...] }
 *
 * Only the `message` string is returned to be shown in the UI.
 * The `details` array (raw FHIR OperationOutcome) is logged to the console only —
 * it is intentionally hidden from the user.
 */
export const extractBFFErrorMessage = (error: any): string => {
  const bffData = error?.response?.data;

  if (bffData) {
    // Log raw FHIR details for developer debugging only — never shown in UI
    if (bffData.details?.length) {
      console.error('[SATUSEHAT FHIR Error Details]', bffData.details);
    }

    // Return the human-readable Indonesian message from the BFF
    if (bffData.message) {
      return bffData.message;
    }
  }

  // Fallback: raw axios/network error
  return error?.message || 'Terjadi kesalahan yang tidak diketahui';
};
