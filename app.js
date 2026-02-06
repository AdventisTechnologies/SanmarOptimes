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
const Contractor = require('./routes/contractor.routes')
const workerRoutes = require("./routes/worker.routes");

const ChemicalRoutes = require('./routes/chemical');
const ChemicaladdRoutes = require('./routes/chemicaladd');
const CheckStock = require('./routes/chemicalstock');
const inventoryBuy = require('./routes/Invebuy');
const inventoryStockBuy = require('./routes/Investockbuy');
const LocationRoutes = require('./routes/location');
const app = express();



// ✅ FIXED: CORS configuration without wildcard options
app.use(cors({
  origin: ['https://sanmaroptimes.onrender.com', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', "PATCH", 'DELETE', 'OPTIONS'],
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
app.use('/api/user/contractors', Contractor);
app.use("/api/user/workers", workerRoutes);


app.use('/api/user', ChemicalRoutes);
app.use('/api/user', ChemicaladdRoutes);
app.use('/api/user', CheckStock);
app.use('/api/getinventorybuy', inventoryStockBuy);
app.use('/api/getinventory', inventoryBuy);
app.use('/api/user', LocationRoutes);

app.use("/api/user/inductions", require("./routes/induction.routes"));
app.use("/api/user/trainings", require("./routes/training.routes"));
app.use("/api/user/worker-trainings", require("./routes/worker-training.routes"));
app.use("/api/user/ppe-master", require("./routes/ppe-master.routes"));
app.use("/api/user/ppe-issues", require("./routes/ppe-issue.routes"));
app.use("/api/user/permit-types", require("./routes/permit-type.routes"));
app.use("/api/user/permits", require("./routes/permit.routes"));
app.use("/api/user/incidents", require("./routes/incident.routes"));
app.use("/api/user/capa", require("./routes/capa.routes"));
app.use("/api/user/site-entries", require("./routes/site-entry.routes"));
app.use('/api/work-type-master', require('./routes/workTypeMaster.routes'));



// Serve Frontend
// Serve Frontend (Angular)
const frontendPath = path.join(__dirname, 'OptiMES', 'browser');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}


module.exports = app;