const express = require('express');
const router = express.Router();
const ChemicaladdController = require('../controllers/chemicaladd');

router.post('/chemicaladd', ChemicaladdController.ChemicaladdDetailspost);
router.get('/chemicaladd', ChemicaladdController.ChemicaladdDetailsget);
router.put('/chemicaladdupdate/:id',ChemicaladdController.ChemicaladdDetailsupdate);
router.delete('/chemicaladddelete/:id',ChemicaladdController.ChemicaladdDetailsdelete)

module.exports = router;