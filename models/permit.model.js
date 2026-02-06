const mongoose = require("mongoose");

const PermitSchema = new mongoose.Schema({
  permitNo: { type: String, unique: true, required: true },

  permitTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PermitType",
    required: true
  },

  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contractor",
    required: true
  },

  workLocation: String,
  jobDescription: String,

  riskAssessment: [{
    hazard: String,
    mitigation: String
  }],

  workers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker"
  }],

  validFrom: Date,
  validTo: Date,

  status: {
    type: String,
    enum: ["DRAFT", "ISSUED", "APPROVED", "CLOSED", "CANCELLED"],
    default: "DRAFT"
  },

  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

/* 🔥 INDEXES */
PermitSchema.index({ permitNo: 1 }, { unique: true });
PermitSchema.index({ status: 1 });
PermitSchema.index({ validTo: 1 });

module.exports = mongoose.model("Permit", PermitSchema);
