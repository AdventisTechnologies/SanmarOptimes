const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designation');

// Use RESTful naming conventions with consistent endpoints
router.post('/', designationController.DesignationDetailspost);
router.get('/', designationController.DesignationDetailsget);
router.put('/:id', designationController.DesignationDetailsupdate);
router.delete('/:id', designationController.DesignationDetailsdelete);

module.exports = router;