const express = require('express');
const router = express.Router();
const StockController = require('../controllers/chemicalstock');

router.post('/stock', StockController.StockDetailspost);
router.get('/stock', StockController.StockDetailsget);
// router.put('/stockupdate/:id',StockController.takeStockOut);
router.put('/stockupdate',StockController.takeStockOut);
router.delete('/stockdelete/:id',StockController.StockDetailsdelete)

module.exports = router;





