const mongoose = require("mongoose");

const CapaSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true
    },

    actionType: {
      type: String,
      enum: ["CORRECTIVE", "PREVENTIVE"],
      required: true
    },

    actionDescription: String,

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    targetDate: Date,

    status: {
      type: String,
      enum: ["OPEN", "COMPLETED", "OVERDUE"],
      default: "OPEN"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Capa", CapaSchema);
