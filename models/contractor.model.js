const mongoose = require("mongoose");

/* ---------- Sub Schemas ---------- */

const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  country: { type: String, default: "India" },
  pincode: String
});

const ContactPersonSchema = new mongoose.Schema({
  name: String,
  designation: String,
  phone: String,
  email: String
});

const DocumentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // license, insurance, gst, etc.
  fileUrl: { type: String, required: true },
  expiryDate: { type: Date }
});

/* ---------- Main Schema ---------- */

const ContractorSchema = new mongoose.Schema(
  {
    contractorCode: {
      type: String,
      unique: true,
      required: true
    },

    companyName: {
      type: String,
      required: true
    },

    companyAddress: AddressSchema,

    gstNumber: {
      type: String,
      uppercase: true,
      match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    },

    panNumber: {
      type: String,
      uppercase: true
    },

    tradeCategory: [String],

    contactDetails: {
      phone: String,
      email: {
        type: String,
        lowercase: true
      },
      alternatePhone: String
    },

    contactPerson: ContactPersonSchema,

    licenseDetails: {
      licenseNo: String,
      issuedBy: String,
      validFrom: Date,
      validTo: Date
    },

    insuranceDetails: {
      policyNo: String,
      provider: String,
      validFrom: Date,
      validTo: Date,
      coverageAmount: Number
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "EXPIRED", "BLACKLISTED"],
      default: "ACTIVE"
    },

    safetyRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    lastAuditDate: Date,
    nextAuditDue: Date,

    documents: [DocumentSchema],

    remarks: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contractor", ContractorSchema);
