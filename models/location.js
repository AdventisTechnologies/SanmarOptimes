const mongoose = require('mongoose');

const LocationNameSchema = new mongoose.Schema({
  locationname: {
    type: String,
    required: true,
    unique: true,
    trim: true 
  },
  suggestedStorageTemperature: {
    value: { type: String, required: true },
    unit: { type: String, enum: ['°C', '°F'], default: '°C' }
  },
  quantity: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['L', 'ml', 'g', 'kg'], required: true }
  },
  availablequantity: {
    value: { type: Number, required: false },
    unit: { type: String, enum: ['L', 'ml', 'g', 'kg'], required: false }
  },
  occupiedquantity: {
    value: { type: Number, required: false },
    unit: { type: String, enum: ['L', 'ml', 'g', 'kg'], required: false }
  },
  price: {
    value: { type: Number, required: false },
    unit: { type: String, enum: ['INR', 'USD', 'EUR'], required: false }
  },
  chemicalStocks: [
    {
      itemname: { type: String, required: true },
      itemndescription: { type: String, required: true },
      capacity: {
        value: { type: Number, required: true },
        unit: { type: String, enum: ['L', 'ml', 'g', 'kg'], required: true }
      },
      price: {
        value: { type: Number, default: 0 },
        unit: { type: String, enum: ['INR', 'USD', 'EUR'], default: 'INR' }
      },
      expiryDate: { type: String, required: true },
      stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'chemicalstock' } // Reference to central stock
    }
  ]
}, {
  timestamps: true
});

const Location = mongoose.model('LocationName', LocationNameSchema);
module.exports = Location;