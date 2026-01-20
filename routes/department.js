const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department');

// Consistent RESTful endpoints
router.post('/', departmentController.DepartmentDetailspost);
router.get('/', departmentController.DepartmentDetailsget);
router.put('/:id', departmentController.DepartmentDetailsupdate);
router.delete('/:id', departmentController.DepartmentDetailsdelete);

module.exports = router;