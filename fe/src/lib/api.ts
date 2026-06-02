import { apiClient } from './apiClient';
import { 
  FHIRBundle, 
  FHIRPatient, 
  FHIRPractitioner, 
  FHIRLocation, 
  FHIREncounter,
  FHIROperationOutcome 
} from '@/types';

// Patient APIs
export const patientAPI = {
  searchByNIK: async (nik: string): Promise<FHIRBundle> => {
    // Validate NIK format (16 digits)
    if (!/^\d{16}$/.test(nik)) {
      throw new Error('NIK must be exactly 16 digits');
    }

    // Construct the FHIR identifier query parameter
    const identifier = `https://fhir.kemkes.go.id/id/nik|${nik}`;
    
    const response = await apiClient.get('/api/fhir/patient', {
      params: {
        identifier,
      },
    });
    
    return response.data;
  },

  create: async (patientData: Partial<FHIRPatient>): Promise<FHIRPatient> => {
    const response = await apiClient.post('/api/fhir/patient', patientData);
    return response.data;
  },

  getAll: async (): Promise<FHIRBundle> => {
    const response = await apiClient.get('/api/fhir/patient');
    return response.data;
  },
};

// Practitioner APIs
export const practitionerAPI = {
  search: async (query?: string): Promise<FHIRBundle> => {
    const response = await apiClient.get('/api/fhir/practitioner', {
      params: query ? { name: query } : {},
    });
    return response.data;
  },

  create: async (practitionerData: Partial<FHIRPractitioner>): Promise<FHIRPractitioner> => {
    const response = await apiClient.post('/api/fhir/practitioner', practitionerData);
    return response.data;
  },

  getAll: async (): Promise<FHIRBundle> => {
    const response = await apiClient.get('/api/fhir/practitioner');
    return response.data;
  },
};

// Location APIs
export const locationAPI = {
  search: async (query?: string): Promise<FHIRBundle> => {
    const response = await apiClient.get('/api/fhir/location', {
      params: query ? { name: query } : {},
    });
    return response.data;
  },

  create: async (locationData: Partial<FHIRLocation>): Promise<FHIRLocation> => {
    const response = await apiClient.post('/api/fhir/location', locationData);
    return response.data;
  },

  getAll: async (): Promise<FHIRBundle> => {
    const response = await apiClient.get('/api/fhir/location');
    return response.data;
  },
};

// Encounter APIs
export const encounterAPI = {
  create: async (encounterData: Partial<FHIREncounter>): Promise<FHIREncounter> => {
    const response = await apiClient.post('/api/fhir/encounter', encounterData);
    return response.data;
  },
};

// Auth APIs
export const authAPI = {
  testAuth: async (): Promise<any> => {
    const response = await apiClient.get('/api/auth/test-auth');
    return response.data;
  },
};

// Helper function to extract error message from FHIR OperationOutcome
export const extractFHIRErrorMessage = (error: any): string => {
  if (error.response?.data?.issue?.[0]) {
    const issue = error.response.data.issue[0];
    return issue.diagnostics || issue.details?.text || issue.code || 'An error occurred';
  }
  return error.message || 'An unexpected error occurred';
};
