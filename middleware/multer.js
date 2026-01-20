// const multer = require('multer');

// // Multer setup for memory storage (store the file in memory as a buffer)
// const storage = multer.memoryStorage();

// const upload = multer({ storage: storage });

// module.exports = { upload };




// Import multer
const multer = require('multer');
const upload = multer();

// Register route
router.post(
  '/Register',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 }
  ]),
  EmployeeController.EmployeeRegistration
);


