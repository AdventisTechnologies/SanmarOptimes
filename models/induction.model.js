const mongoose = require("mongoose");

const InductionSchema = new mongoose.Schema(
  {
    /* 🔗 CORE REFERENCES */
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true
    },

    siteId: {
      type: String,
      required: false
    },

    /* 🏷 INDUCTION DETAILS */
    inductionType: {
      type: String,
      enum: ["SITE", "JOB_SPECIFIC"],
      required: true
    },

    inductionTitle: {
      type: String // e.g. "Site Safety Induction – Unit 3"
    },

    description: {
      type: String
    },

    /* 👨‍🏫 CONDUCTED BY */
conductedBy: {
  type: String,
  required: true
},

    conductedByName: {
      type: String // backup if user is deleted
    },

    /* 📊 ASSESSMENT */
    score: {
      type: Number,
      min: 0,
      max: 100
    },

    passMark: {
      type: Number,
      default: 60
    },

    result: {
      type: String,
      enum: ["PASS", "FAIL"],
      default: "PASS"
    },

    /* 📅 VALIDITY */
    validFrom: {
      type: Date,
      required: true,
      default: Date.now
    },

    validTo: {
      type: Date
    },

    validityDays: {
      type: Number // optional auto-calc helper
    },

    /* 📄 CERTIFICATE */
    certificateUrl: {
      type: String
    },

    certificateNumber: {
      type: String
    },

    /* 📍 MODE & LOCATION */
    inductionMode: {
      type: String,
      enum: ["CLASSROOM", "ONLINE", "ON_SITE"],
      default: "ON_SITE"
    },

    location: {
      type: String
    },

    /* 🧾 STATUS */
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "REVOKED"],
      default: "ACTIVE"
    },

    /* 🚨 SAFETY FLAGS */
    safetyBriefingCompleted: {
      type: Boolean,
      default: true
    },

    emergencyProceduresExplained: {
      type: Boolean,
      default: true
    },

    /* 📝 REMARKS */
    remarks: {
      type: String
    },

    /* 🔐 AUDIT */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Induction", InductionSchema);
