const mongoose = require('mongoose');

const DeclarationSchema = new mongoose.Schema({
  question: { type: String, required: true }
});

const WorkTypeMasterSchema = new mongoose.Schema({
  workType: { type: String, required: true, unique: true },

  activities: [{ type: String }],

  ppe: [{ type: String }],

  safetyDeclarations: [DeclarationSchema]

}, { timestamps: true });

module.exports = mongoose.model('WorkTypeMaster', WorkTypeMasterSchema);
