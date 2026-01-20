const express = require('express');
const Router = express.Router();
const EmployeeController = require('../controllers/register');
const multer = require('multer');

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Employee Routes - UPDATED TO INCLUDE SIGNATURE
Router.post('/register', upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'left', maxCount: 1 },
  { name: 'right', maxCount: 1 },
  { name: 'signature', maxCount: 1 } // ADDED THIS LINE
]), EmployeeController.EmployeeRegistration);

Router.put('/employees/:id', upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'left', maxCount: 1 },
  { name: 'right', maxCount: 1 },
  { name: 'signature', maxCount: 1 } // ADDED THIS LINE
]), EmployeeController.updateEmployeeDetails);

Router.post('/LogIn', EmployeeController.Login);
Router.get('/LogInData', EmployeeController.UserDetails);
Router.delete('/RegisterDelete/:id', EmployeeController.EmployeeDetailsDelete);

module.exports = Router;