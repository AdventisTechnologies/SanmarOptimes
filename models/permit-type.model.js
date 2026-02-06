const mongoose = require("mongoose");

const PermitTypeSchema = new mongoose.Schema({
  permitCode: { type: String, unique: true, required: true },
  permitName: { type: String, required: true },

  riskChecklist: [String],

  requiredPPE: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "PpeMaster"
  }],

  approvalLevels: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model("PermitType", PermitTypeSchema);
