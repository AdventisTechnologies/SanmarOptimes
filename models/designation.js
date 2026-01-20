const mongoose = require('mongoose');

const DesignationSchema = mongoose.Schema({
    designation: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Designation', DesignationSchema);