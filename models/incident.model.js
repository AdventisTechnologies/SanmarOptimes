const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    incidentNo: { type: String, unique: true, required: true },

    incidentType: {
      type: String,
      enum: ["INJURY", "NEAR_MISS", "PROPERTY_DAMAGE"],
      required: true
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "FATAL"],
      required: true
    },

    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor"
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker"
    },

    location: String,
    description: String,
    occurredOn: Date,

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["OPEN", "UNDER_INVESTIGATION", "CLOSED"],
      default: "OPEN"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", IncidentSchema);
