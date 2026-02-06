const mongoose = require('mongoose');

const ChemicalNameSchema = new mongoose.Schema({
  chemicalname: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

const Chemical = mongoose.model('ChemicalName', ChemicalNameSchema);

module.exports = Chemical;
