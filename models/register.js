const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeID: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Rfid: { type: String, required: true, unique: true },
  Department: { type: String, required: true },
  Designation: { type: String, required: true },
  EmailID: { type: String, required: true, unique: true },
  MobileNumber: { type: String, unique: true, sparse: true },
  Password: { type: String, required: true },
  Location: { type: String, required: true },
  EmployeeImage: {
    front: { type: String, required: true },
    left: { type: String, required: true },
    right: { type: String, required: true },
    signature: { type: String, required: true } // ADD THIS LINE
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);