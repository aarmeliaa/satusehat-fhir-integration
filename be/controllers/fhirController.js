const {
  createFhirResource,
  readFhirResource,
  searchFhirResource,
  buildPatientFhirParams,
  buildPractitionerFhirParams,
  buildLocationFhirParams,
  buildOrganizationFhirParams,
  FhirError,
} = require('../services/satusehatService');

// ─── Shared error responder ──────────────────────────────────────────────────

/**
 * Sends a clean, consistent JSON error response to the frontend.
 * If the error is a FhirError, it uses its structured data.
 * Otherwise it falls back to a generic 500 response.
 *
 * Response shape:
 *   { success: false, message: string, details: Array }
 */
function sendError(res, error) {
  if (error instanceof FhirError) {
    return res.status(error.httpStatus).json({
      success: false,
      message: error.message,
      details: error.details,   // raw FHIR OperationOutcome issues (may be [])
    });
  }

  // Unexpected error — log it but don't leak internals to the client
  console.error('[fhirController] Unexpected error:', error);
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server. Coba lagi atau hubungi administrator.',
    details: [],
  });
}

// ─── POST Handlers ───────────────────────────────────────────────────────────

async function createPatient(req, res) {
  try {
    const result = await createFhirResource('Patient', req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createPractitioner(req, res) {
  try {
    const result = await createFhirResource('Practitioner', req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createLocation(req, res) {
  try {
    const result = await createFhirResource('Location', req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createEncounter(req, res) {
  try {
    const result = await createFhirResource('Encounter', req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

// ─── GET / Search Handlers (BFF Layer) ──────────────────────────────────────

/**
 * GET /api/fhir/patient
 *
 * Accepted frontend params (all optional, at least one recommended):
 *   ?nik=1234567890123456        → translated to identifier=https://fhir.kemkes.go.id/id/nik|...
 *   ?name=Budi
 *   ?birthdate=1990-01-01
 *   ?gender=male
 *   ?_count=10&_page=1
 *
 * The backend constructs the proper FHIR identifier string internally.
 * The frontend never needs to know about FHIR system URIs.
 */
async function searchPatient(req, res) {
  try {
    // Translate frontend-friendly params → FHIR params (may throw FhirError on bad NIK)
    const fhirParams = buildPatientFhirParams(req.query);

    if (Object.keys(fhirParams).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Harap sertakan minimal satu parameter pencarian: nik, name, atau birthdate.',
        details: [],
      });
    }

    const result = await searchFhirResource('Patient', fhirParams);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/fhir/practitioner
 *
 * Accepted frontend params:
 *   ?nik=1234567890123456        → identifier=https://fhir.kemkes.go.id/id/nik|...
 *   ?nip=198901012015011001      → identifier=https://fhir.kemkes.go.id/id/nip|...
 *   ?ihs-number=...             → identifier=https://fhir.kemkes.go.id/id/ihs-number|...
 *   ?name=dr. Budi
 *   ?_count=10&_page=1
 *
 * If both nik and name are provided, nik takes priority for the identifier param.
 */
async function searchPractitioner(req, res) {
  try {
    const fhirParams = buildPractitionerFhirParams(req.query);

    if (Object.keys(fhirParams).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Harap sertakan minimal satu parameter pencarian: nik, nip, ihs-number, atau name.',
        details: [],
      });
    }

    const result = await searchFhirResource('Practitioner', fhirParams);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/fhir/location
 *
 * Accepted frontend params:
 *   ?name=Poli+Umum
 *   ?status=active
 *   ?_count=10&_page=1
 */
async function searchLocation(req, res) {
  try {
    const fhirParams = buildLocationFhirParams(req.query);
    const result = await searchFhirResource('Location', fhirParams);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/fhir/organization
 *
 * Search organizations in SATUSEHAT.
 * SATUSEHAT only allows: ?name=, ?identifier=, ?partof=
 *
 * Use GET /api/fhir/organization/:id for a direct read by UUID.
 */
async function searchOrganization(req, res) {
  try {
    const fhirParams = buildOrganizationFhirParams(req.query);
    const result = await searchFhirResource('Organization', fhirParams);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/fhir/organization/:id
 *
 * Direct read of a single Organization resource by its FHIR ID (UUID).
 * This is the correct way to look up an org when you already have its UUID
 * from the SSP portal, since SATUSEHAT's search endpoint rejects ?_id=.
 *
 * From the response, read:
 *   resource.id                      → UUID (FHIR resource ID)
 *   resource.identifier[].value      → Kode Faskes integer (use THIS for Encounter)
 *   resource.name                    → Facility name
 *
 * Example: GET /api/fhir/organization/f0930057-d5f7-4dd9-a0f6-465283102ad3
 */
async function readOrganization(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID diperlukan di path: /api/fhir/organization/:id',
        details: [],
      });
    }
    const result = await readFhirResource('Organization', id);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/fhir/search  (generic / legacy)
 *
 * Requires ?resourceType=Patient|Practitioner|Location|...
 * Remaining query params are forwarded as-is to SATUSEHAT.
 *
 * NOTE: This endpoint bypasses the BFF translation layer on purpose —
 * it is kept for internal/debug use only. Callers are responsible for
 * sending correct FHIR params.
 */
async function searchResource(req, res) {
  try {
    const { resourceType, ...rest } = req.query;

    if (!resourceType) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "resourceType" wajib diisi.',
        details: [],
      });
    }

    const result = await searchFhirResource(resourceType, rest);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createPatient,
  createPractitioner,
  createLocation,
  createEncounter,
  searchPatient,
  searchPractitioner,
  searchLocation,
  searchOrganization,
  readOrganization,
  searchResource,
};