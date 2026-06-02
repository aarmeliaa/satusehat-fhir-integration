require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { config, validateConfig } = require('./config');
const authRoutes = require('./routes/auth');
const fhirRoutes = require('./routes/fhir');

validateConfig();

const app = express();
const cors = require('cors');
app.use(express.json());

app.use(cors());

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/docs.json', (req, res) => res.json(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/fhir', fhirRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SATUSEHAT Integration API is running' });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});