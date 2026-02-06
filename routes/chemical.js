const express = require('express');
const router = express.Router();
const ChemicalController = require('../controllers/chemical');

router.post('/chemical', ChemicalController.ChemicalDetailspost);
router.get('/chemical', ChemicalController.ChemicalDetailsget);
router.get('/chemicaldata', ChemicalController.GetMatchingChemicalDetails);
router.put('/chemicalupdate/:id', ChemicalController.ChemicalDetailsupdate);
router.delete('/chemicaldelete/:id', ChemicalController.ChemicalDetailsdelete);

module.exports = router;
