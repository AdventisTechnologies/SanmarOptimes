const mongoose = require("mongoose");

const PpeIssueSchema = new mongoose.Schema(
  {
    /* 🔗 CORE REFERENCES */
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true
    },

    ppeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PpeMaster",
      required: true
    },

    /* 📅 ISSUE DETAILS */
    issuedOn: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    /* 🆕 ISSUE CONTEXT */
    issueReason: {
      type: String,
      enum: ["NEW_JOINING", "REPLACEMENT", "DAMAGE", "LOSS", "EXPIRY"],
      default: "NEW_JOINING"
    },

    siteId: {
      type: String
    },

    jobRole: {
      type: String
    },

    /* 📦 PPE DETAILS AT ISSUE TIME */
    sizeIssued: {
      type: String // S, M, L, XL, Free Size
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    reusable: {
      type: Boolean,
      default: true
    },

    /* 🧾 ACKNOWLEDGEMENT */
    acknowledgedByWorker: {
      type: Boolean,
      default: false
    },

    acknowledgementDate: {
      type: Date
    },

    /* 🔁 RETURN / REPLACEMENT */
    returnedOn: {
      type: Date
    },

    conditionOnReturn: {
      type: String,
      enum: ["GOOD", "DAMAGED", "WORN_OUT", "LOST"]
    },

    replacementIssued: {
      type: Boolean,
      default: false
    },

    replacedByIssueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PpeIssue"
    },

    /* 🚨 STATUS */
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "LOST", "RETURNED"],
      default: "ACTIVE"
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

module.exports = mongoose.model("PpeIssue", PpeIssueSchema);
