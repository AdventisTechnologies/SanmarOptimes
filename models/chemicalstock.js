const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['INCOMING', 'OUTGOING', 'TRANSFER'],
    required: true
  },
  quantity: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['L', 'ml', 'g', 'kg'], required: true }
  },
  fromLocation: { type: String },
  toLocation: { type: String },
  purpose: { type: String },
  date: { type: Date, default: Date.now },
  reference: { type: String } // PO number, work order, etc.
});

const ChemicalStockSchema = new mongoose.Schema({
  itemname: {
    type: String,
    required: true
  },
  itemndescription: {
    type: String,
    required: true
  },
  capacity: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['L', 'ml', 'g', 'kg'], required: true }
  },
  price: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['INR', 'USD', 'EUR'], required: false }
  },
  location: [{ type: String, required: true }],
  expiryDate: { type: String, required: true },
  purchaseDate: { type: String, required: true },
  movements: [StockMovementSchema] // Track all movements
}, {
  timestamps: true
});

const stock = mongoose.model('chemicalstock', ChemicalStockSchema);
module.exports = stock;