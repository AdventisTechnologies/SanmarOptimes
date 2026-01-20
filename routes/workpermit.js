const express = require('express');
const router = express.Router();
const workPermitController = require('../controllers/workpermit');

// Configure multer for file uploads
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Permit CRUD operations
router.post('/create', workPermitController.createPermit);
router.get('/', workPermitController.getPermits);
router.get('/counts', workPermitController.getPermitCounts);
router.get('/closed', workPermitController.getClosedPermits);
router.get('/:id', workPermitController.getPermitById);
router.put('/:id', workPermitController.updatePermit);
router.put('/updatedateandtime/:id', workPermitController.updatePermitDateTime);
router.delete('/:id', workPermitController.deletePermit);

// Approval workflow
router.put('/:id/approval', workPermitController.updateApprovalStatus);

// Permit lifecycle
router.put('/:id/complete', workPermitController.completePermit);
router.put('/:id/close', workPermitController.closePermit);

// Electrical declaration
router.post('/send-electrical-declaration', workPermitController.sendElectricalDeclaration);

// Electrical declaration submission with file uploads
router.post('/submit-electrical-declaration', 
  upload.fields([
    { name: 'photo1', maxCount: 1 },
    { name: 'photo2', maxCount: 1 },
    { name: 'photo3', maxCount: 1 },
    { name: 'photo4', maxCount: 1 },
    { name: 'photo5', maxCount: 1 }
  ]), 
  workPermitController.submitElectricalDeclaration
);

router.get('/permit-number/:permitNumber', workPermitController.getPermitByNumber);

// Electrical declaration form
router.get('/electrical-declaration/:permitNumber', workPermitController.showElectricalDeclarationForm);

// Electrical engineers and internal declarations
router.get('/electrical-engineers', workPermitController.getElectricalEngineers);
router.post('/submit-internal-electrical-declaration', workPermitController.submitInternalElectricalDeclaration);

module.exports = router;