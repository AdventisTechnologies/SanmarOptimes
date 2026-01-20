const express = require('express');
const router = express.Router();
const CameraController = require('../controllers/camera');

// RESTful routes with consistent naming
router.post('/cameras', CameraController.CameraPost);
router.get('/cameras', CameraController.CamereGet);
router.put('/cameras/:id', CameraController.CamereUpdate);
router.delete('/cameras/:id', CameraController.CamereDelete);

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const cameraController = require('../controllers/camera');

// // POST - Create new camera
// router.post('/camerapost', cameraController.CameraPost);

// // GET - Get all cameras
// router.get('/cameraget', cameraController.CamereGet);

// // PUT - Update camera by ID
// router.put('/cameraupdate/:id', cameraController.CamereUpdate);

// // DELETE - Delete camera by ID
// router.delete('/cameradelete/:id', cameraController.CamereDelete);

// module.exports = router;