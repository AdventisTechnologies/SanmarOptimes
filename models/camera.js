const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: false,
        trim: true
    },
    Password: {
        type: String,
        required: false,
        trim: true
    },
    CameraDetails: {
        type: String,
        required: false,
        trim: true
    },
    CameraLocationName: {
        type: String,
        required: false,
        trim: true
    },
    CameraLocationID: {
        type: String,
        unique: true,
        sparse: true,
        required: false,
        trim: true
    },
    LocationDescription: {
        type: String,
        required: false,
        trim: true
    },
    IPAddress: {
        type: String,
        unique: true,
        sparse: true,
        required: false,
        trim: true,
        validate: {
            validator: function(v) {
                // Basic IP address validation
                return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v);
            },
            message: 'Please enter a valid IP address'
        }
    },
    Port: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{1,5}$/.test(v) && parseInt(v) <= 65535;
            },
            message: 'Please enter a valid port number (1-65535)'
        }
    },
    RTSPandRTMP: {
        type: String,
        required: false,
        trim: true
    },
    CameraVisibility: {
        type: Boolean,
        required: true,
        default: true
    },
}, {
    timestamps: true
});

// Compound index for better performance
CameraSchema.index({ CameraLocationID: 1, IPAddress: 1 });

module.exports = mongoose.model('CameraData', CameraSchema);