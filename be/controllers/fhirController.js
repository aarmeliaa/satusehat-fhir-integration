const {
  createFhirResource,
  searchFhirResource,
  buildPatientFhirParams,
  buildPractitionerFhirParams,
  buildLocationFhirParams,
  FhirError,
} = require('../services/satusehatService');


function sendError(res, error) {
  if (error instanceof FhirError) {
    return res.status(error.httpStatus).json({
      success: false,
      message: error.message,
      details: error.details,   
    });
  }

  console.error('[fhirController] Unexpected error:', error);
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server. Coba lagi atau hubungi administrator.',
    details: [],
  });
}

// POST Handlers 

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

// GET / Search Handlers (BFF Layer) 
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


 // GET /api/fhir/practitioner

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


 // GET /api/fhir/location

async function searchLocation(req, res) {
  try {
    const fhirParams = buildLocationFhirParams(req.query);
    const result = await searchFhirResource('Location', fhirParams);
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
}


 // GET /api/fhir/search  
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

// Exports 

module.exports = {
  createPatient,
  createPractitioner,
  createLocation,
  createEncounter,
  searchPatient,
  searchPractitioner,
  searchLocation,
  searchResource,
};