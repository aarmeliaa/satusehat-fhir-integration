const { createFhirResource, searchFhirResource } = require('../services/satusehatService');

async function createLocation(req, res) {
  try {
    const result = await createFhirResource('Location', req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function createPatient(req, res) {
  try {
    const result = await createFhirResource('Patient', req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function createPractitioner(req, res) {
  try {
    const result = await createFhirResource('Practitioner', req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function createEncounter(req, res) {
  try {
    const result = await createFhirResource('Encounter', req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function searchResource(req, res) {
  try {
    const resourceType = req.query.resourceType;
    if (!resourceType) {
      return res.status(400).json({ success: false, error: 'Query parameter resourceType wajib diisi' });
    }

    const params = { ...req.query };
    delete params.resourceType;

    const result = await searchFhirResource(resourceType, params);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function searchPatient(req, res) {
  try {
    const params = { ...req.query };
    const result = await searchFhirResource('Patient', params);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function searchPractitioner(req, res) {
  try {
    const params = { ...req.query };
    const result = await searchFhirResource('Practitioner', params);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

async function searchLocation(req, res) {
  try {
    const params = { ...req.query };
    const result = await searchFhirResource('Location', params);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json({ success: false, error: data });
  }
}

module.exports = {
  createLocation,
  createPatient,
  createPractitioner,
  createEncounter,
  searchResource,
  searchPatient,
  searchPractitioner,
  searchLocation
};