const express = require('express');
const fhirController = require('../controllers/fhirController');

const router = express.Router();

router.post('/patient', fhirController.createPatient);
router.post('/practitioner', fhirController.createPractitioner);
router.post('/location', fhirController.createLocation);
router.post('/encounter', fhirController.createEncounter);

router.get('/patient', fhirController.searchPatient);
router.get('/practitioner', fhirController.searchPractitioner);
router.get('/location', fhirController.searchLocation);
router.get('/search', fhirController.searchResource);

module.exports = router;