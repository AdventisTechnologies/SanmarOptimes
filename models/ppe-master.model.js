const mongoose = require("mongoose");

const PpeMasterSchema = new mongoose.Schema(
  {
    ppeCode: {
      type: String,
      unique: true,
      required: true
    },

    ppeName: {
      type: String,
      required: true
    },

    ppeType: {
      type: String,
      enum: ["HEAD", "EYE", "HAND", "FOOT", "BODY", "RESPIRATORY", "EAR", "FALL"],
      required: true
    },

    expiryRequired: {
      type: Boolean,
      default: false
    },

    /* 🆕 ADDITIONAL FIELDS */

    description: String,

    // Mandatory for which trades
    mandatoryForTrades: {
      type: [String],
      default: []
    },

    // Mandatory for which skill levels
    mandatoryForSkillLevels: {
      type: [String],
      enum: ["UNSKILLED", "SKILLED", "SUPERVISOR"],
      default: []
    },

    // Replacement / validity period
    validityDays: {
      type: Number,
      min: 0
    },

    // PPE size / variant
    sizeApplicable: {
      type: Boolean,
      default: false
    },

    availableSizes: {
      type: [String] // S, M, L, XL, Free Size
    },

    // Certification & standards
    certificationStandard: String, // IS, EN, ANSI etc.
    certifiedBy: String,

    // Stock / issue control
    reusable: {
      type: Boolean,
      default: true
    },

    // Status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
    
    remarks: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PpeMaster", PpeMasterSchema);
