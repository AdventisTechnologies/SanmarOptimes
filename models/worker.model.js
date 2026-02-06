const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  line1: String,
  city: String,
  state: String,
  pincode: String
});

const WorkerSchema = new mongoose.Schema(
  {
    workerCode: { type: String, required: true, unique: true },

    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true
    },

    name: String,
    gender: String,
    dob: Date,
    trade: {
  type: [String],
  default: []
  },

    skillLevel: {
      type: String,
      enum: ["UNSKILLED", "SKILLED", "SUPERVISOR"],
      default: "UNSKILLED"
    },

    biometricId: String,

    /* 🆕 ADDED FIELDS */

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    },

    contactDetails: {
      phone: String,
      email: String
    },

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },

    address: AddressSchema,

    idProof: {
      idType: {
        type: String,
        enum: ["AADHAAR", "PASSPORT", "VOTER_ID", "DL"]
      },
      idNumber: String
    },

    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    },

    joiningDate: Date,

    ppeIssued: {
      helmet: { type: Boolean, default: false },
      shoes: { type: Boolean, default: false },
      jacket: { type: Boolean, default: false }
    },

    profilePhoto: String, // S3 URL

    medicalFitness: {
      fitStatus: { type: Boolean, default: false },
      validTo: Date
    },

    inductionStatus: { type: Boolean, default: false },
    active: { type: Boolean, default: true },

    documents: [
      {
        type: { type: String, required: true },
        fileUrl: { type: String, required: true },
        expiryDate: Date
      }
    ],

    remarks: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", WorkerSchema);
