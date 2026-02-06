const mongoose = require('mongoose');

const ChemicalSchema = new mongoose.Schema({
  chemicalName: { type: String, required: true,unique:true },
  compatibleChemicals: { type: [String], default: [] },
  incompatibleChemicals: { type: [String], default: [] },
  suggestedStorageTemperature: {
    value: { type: String, required: true },
    unit: { type: String, enum: ['°C', '°F'], default: '°C' }
  },

}, { timestamps: true });

module.exports = mongoose.model('Chemical', ChemicalSchema);
