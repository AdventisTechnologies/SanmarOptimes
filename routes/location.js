const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/location');

// Create new location
router.post('/location', LocationController.LocationDetailspost);

// Get all locations
router.get('/location', LocationController.LocationDetailsget);

// Update location
router.put('/location/:id', LocationController.LocationdDetailsupdate);

// Delete location
router.delete('/location/:id', LocationController.LocationDetailsdelete);

module.exports = router;