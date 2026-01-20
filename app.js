require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Register = require('./routes/register');
const Camera = require('./routes/camera');
const Department = require('./routes/department');
const Designation = require('./routes/designation');
const Workpermit = require('./routes/workpermit');

const app = express();



// ✅ FIXED: CORS configuration without wildcard options
app.use(cors({
  origin: ['https://sanmaroptimes.onrender.com', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// ✅ FIXED: Remove the problematic app.options('*', cors()) line
// The CORS middleware above already handles OPTIONS requests

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes - Use consistent naming
app.use('/api/user', Register);
app.use('/api/user', Camera);
app.use('/api/user/departments', Department);
app.use('/api/user/designations', Designation);
app.use('/api/user/workpermits', Workpermit);



// Serve Frontend
const frontendPath = path.join(__dirname, 'OptiMES');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  
  // Explicit catch-all for non-API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

module.exports = app;