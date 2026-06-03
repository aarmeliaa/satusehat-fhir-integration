const axios = require('axios');
const { config } = require('../config');
const { getAccessToken } = require('./tokenService');

// FHIR Identifier System URIs 
const FHIR_SYSTEMS = {
  nik: 'https://fhir.kemkes.go.id/id/nik',
  nip: 'https://fhir.kemkes.go.id/id/nip',
  ihs: 'https://fhir.kemkes.go.id/id/ihs-number',
};

// Error class for FHIR/SATUSEHAT failures 
class FhirError extends Error {
  /**
   * @param {string} message      Human-readable message forwarded to the frontend
   * @param {number} httpStatus   HTTP status to respond with (default 502)
   * @param {Array}  details      Raw FHIR OperationOutcome issues (may be empty)
   */
  constructor(message, httpStatus = 502, details = []) {
    super(message);
    this.name = 'FhirError';
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

// Axios client 
const client = axios.create({
  baseURL: config.baseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/fhir+json',
  },
});

// Helpers 
function extractOperationOutcomeMessage(data) {
  if (!data || data.resourceType !== 'OperationOutcome') return null;

  const issues = Array.isArray(data.issue) ? data.issue : [];
  const texts = issues
    .map(
      (issue) =>
        issue.diagnostics ||
        issue.details?.text ||
        issue.details?.coding?.[0]?.display ||
        issue.code
    )
    .filter(Boolean);

  return texts.length > 0 ? texts.join('; ') : 'SATUSEHAT mengembalikan error tanpa keterangan.';
}


function parseSatusehatError(error, resourceType) {
  const status = error.response?.status;
  const data = error.response?.data;
  const issues = data?.issue ?? [];

  const outcomeMessage = extractOperationOutcomeMessage(data);

  if (status === 400) {
    const msg =
      outcomeMessage ||
      `Format permintaan ${resourceType} tidak valid. Periksa kembali parameter yang dikirim.`;
    return new FhirError(msg, 400, issues);
  }

  if (status === 401) {
    return new FhirError(
      'Token autentikasi ke SATUSEHAT tidak valid atau sudah kedaluwarsa.',
      401,
      issues
    );
  }

  if (status === 403) {
    return new FhirError(
      'Akses ditolak oleh SATUSEHAT. Periksa client_id dan scope yang digunakan.',
      403,
      issues
    );
  }

  if (status === 404) {
    const msg =
      outcomeMessage ||
      `Data ${resourceType} tidak ditemukan di SATUSEHAT.`;
    return new FhirError(msg, 404, issues);
  }

  if (status === 422) {
    const msg =
      outcomeMessage ||
      `Data ${resourceType} tidak dapat diproses oleh SATUSEHAT (Unprocessable Entity). Periksa isi payload.`;
    return new FhirError(msg, 422, issues);
  }

  if (status === 429) {
    return new FhirError(
      'Terlalu banyak permintaan ke SATUSEHAT. Coba lagi beberapa saat.',
      429,
      issues
    );
  }

  // Network / timeout / unknown
  if (!error.response) {
    return new FhirError(
      `Tidak dapat terhubung ke SATUSEHAT: ${error.message}`,
      503,
      []
    );
  }

  const fallbackMsg =
    outcomeMessage ||
    `SATUSEHAT mengembalikan error ${status} yang tidak dikenali.`;
  return new FhirError(fallbackMsg, status || 502, issues);
}

// BFF Parameter Translators 
function buildPatientFhirParams(frontendQuery) {
  const fhirParams = {};

  // NIK → FHIR identifier with system URI
  if (frontendQuery.nik) {
    if (!/^\d{16}$/.test(frontendQuery.nik)) {
      throw new FhirError('NIK harus tepat 16 digit angka.', 400);
    }
    fhirParams.identifier = `${FHIR_SYSTEMS.nik}|${frontendQuery.nik}`;
  }

  // Pass through standard FHIR search params unchanged
  if (frontendQuery.name)       fhirParams.name = frontendQuery.name;
  if (frontendQuery.birthdate)  fhirParams.birthdate = frontendQuery.birthdate;
  if (frontendQuery.gender)     fhirParams.gender = frontendQuery.gender;
  if (frontendQuery._count)     fhirParams._count = frontendQuery._count;
  if (frontendQuery._page)      fhirParams._page = frontendQuery._page;

  // Pass through a raw FHIR identifier only if the frontend really needs it
  // (legacy support – prefer 'nik' above)
  if (!fhirParams.identifier && frontendQuery.identifier) {
    fhirParams.identifier = frontendQuery.identifier;
  }

  return fhirParams;
}


 // Translate frontend-friendly Practitioner query params into FHIR search params.

function buildPractitionerFhirParams(frontendQuery) {
  const fhirParams = {};

  if (frontendQuery.nik) {
    if (!/^\d{16}$/.test(frontendQuery.nik)) {
      throw new FhirError('NIK harus tepat 16 digit angka.', 400);
    }
    fhirParams.identifier = `${FHIR_SYSTEMS.nik}|${frontendQuery.nik}`;
  }

  if (frontendQuery.nip && !fhirParams.identifier) {
    fhirParams.identifier = `${FHIR_SYSTEMS.nip}|${frontendQuery.nip}`;
  }

  if (frontendQuery['ihs-number'] && !fhirParams.identifier) {
    fhirParams.identifier = `${FHIR_SYSTEMS.ihs}|${frontendQuery['ihs-number']}`;
  }

  if (frontendQuery.name)   fhirParams.name = frontendQuery.name;
  if (frontendQuery._count) fhirParams._count = frontendQuery._count;
  if (frontendQuery._page)  fhirParams._page = frontendQuery._page;

  // Legacy pass-through
  if (!fhirParams.identifier && frontendQuery.identifier) {
    fhirParams.identifier = frontendQuery.identifier;
  }

  return fhirParams;
}

 // Translate frontend-friendly Location query params into FHIR search params.
function buildLocationFhirParams(frontendQuery) {
  const fhirParams = {};

  if (frontendQuery.name)         fhirParams.name = frontendQuery.name;
  if (frontendQuery.status)       fhirParams.status = frontendQuery.status;
  if (frontendQuery['_count'])    fhirParams._count = frontendQuery._count;
  if (frontendQuery['_page'])     fhirParams._page = frontendQuery._page;
  if (frontendQuery.identifier)   fhirParams.identifier = frontendQuery.identifier;

  return fhirParams;
}


 // Translate frontend-friendly Organization query params into FHIR search params.
function buildOrganizationFhirParams(frontendQuery) {
  const fhirParams = {};

  if (frontendQuery.name)        fhirParams.name = frontendQuery.name;
  if (frontendQuery.partof)      fhirParams.partof = frontendQuery.partof;
  if (frontendQuery.identifier)  fhirParams.identifier = frontendQuery.identifier;
  if (frontendQuery._count)      fhirParams._count = frontendQuery._count;
  if (frontendQuery._page)       fhirParams._page = frontendQuery._page;

  return fhirParams;
}

// Public API 

async function createFhirResource(resourceType, payload) {
  const token = await getAccessToken();

  try {
    const response = await client.post(`/${resourceType}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw parseSatusehatError(error, resourceType);
  }
}

async function readFhirResource(resourceType, resourceId) {
  const token = await getAccessToken();

  try {
    const response = await client.get(`/${resourceType}/${resourceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw parseSatusehatError(error, resourceType);
  }
}


async function searchFhirResource(resourceType, fhirParams = {}) {
  const token = await getAccessToken();

  try {
    const response = await client.get(`/${resourceType}`, {
      params: fhirParams,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw parseSatusehatError(error, resourceType);
  }
}

module.exports = {
  createFhirResource,
  readFhirResource,
  searchFhirResource,
  buildPatientFhirParams,
  buildPractitionerFhirParams,
  buildLocationFhirParams,
  buildOrganizationFhirParams,
  FhirError,
};