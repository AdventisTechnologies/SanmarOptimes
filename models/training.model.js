const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema(
  {
    trainingCode: {
      type: String,
      unique: true,
      required: true
    },

    trainingName: {
      type: String,
      required: true
    },

    description: String,

    // Trades for which this training is mandatory
    mandatoryForTrades: {
      type: [String],
      default: []
    },

    // 🆕 Training category
    category: {
      type: String,
      enum: ["SAFETY", "TECHNICAL", "INDUCTION", "ENVIRONMENT", "QUALITY"],
      default: "SAFETY"
    },

    // 🆕 Training mode
    mode: {
      type: String,
      enum: ["CLASSROOM", "ONLINE", "ON_JOB"],
      default: "CLASSROOM"
    },

    // 🆕 Validity in days
    validityDays: {
      type: Number,
      min: 0
    },

    // 🆕 Duration of training (hours)
    durationHours: {
      type: Number,
      min: 0
    },

    // 🆕 Mandatory or optional
    isMandatory: {
      type: Boolean,
      default: true
    },

    // 🆕 Who conducts the training
    conductedBy: {
      type: String
    },

    // 🆕 Certification details
    certificateRequired: {
      type: Boolean,
      default: false
    },

    certificateTemplateUrl: String,

    // 🆕 Applicability
    applicableToSkillLevels: {
      type: [String],
      enum: ["UNSKILLED", "SKILLED", "SUPERVISOR"],
      default: []
    },

    // 🆕 Status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },

    // 🆕 Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    remarks: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", TrainingSchema);
