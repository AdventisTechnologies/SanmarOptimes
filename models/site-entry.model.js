const mongoose = require("mongoose");

const SiteEntrySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true
    },

    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true
    },

    // gateId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Gate",
    //   required: true
    // },
gateId: {
  type: String,   // ✅ change from ObjectId
  required: true
},

    entryTime: { type: Date, default: Date.now },
    exitTime: Date,

    validationResult: {
      induction: Boolean,
      medical: Boolean,
      ppe: Boolean,
      permit: Boolean
    },

    entryAllowed: Boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteEntry", SiteEntrySchema);
