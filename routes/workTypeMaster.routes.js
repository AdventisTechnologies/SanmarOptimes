const router = require('express').Router();
const controller = require('../controllers/workTypeMaster.controller');

router.post('/save', controller.saveWorkType);       // create / upsert
router.get('/all', controller.getAllWorkTypes);      // get all
router.get('/:id', controller.getWorkTypeById);      // get one
router.put('/:id', controller.updateWorkType);       // update
router.delete('/:id', controller.deleteWorkType);    // delete

module.exports = router;
