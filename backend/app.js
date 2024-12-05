const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: '*', // Temporarily allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Import routes
const imageRoutes = require('./routes/images');
const reportsRoute = require('./api/reports');
const singleimageRoute = require('./api/singleimage'); // Ensure this file is correctly implemented
const carpartsRoute = require('./api/carparts');
const damageAnnotationsRoute = require('./api/damageAnnotations');
const coordinatesRoutes = require('./routes/coordinates');
const referenceNumbersRoutes = require('./routes/referenceNumbers');
const imagescheckRoutes = require('./routes/imagescheck');
const annotationsRoute = require('./routes/annotations');

// Use routes
app.use('/api', imageRoutes);
app.use('/api/imageReports', reportsRoute);
app.use('/api/singleimage', singleimageRoute);
app.use('/api/carparts', carpartsRoute);
app.use('/api/damageannotations', damageAnnotationsRoute);
app.use('/api/coordinates', coordinatesRoutes); // Add the coordinates route
app.use('/api/referenceNumbers', referenceNumbersRoutes); // Add the route
app.use('/api/imagescheck', imagescheckRoutes); // Add the route
app.use('/api/annotations', annotationsRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
