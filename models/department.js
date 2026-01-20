const mongoose = require('mongoose');

const DepartmentSchema = mongoose.Schema({
    department: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Department', DepartmentSchema);