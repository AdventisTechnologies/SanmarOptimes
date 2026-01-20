const CameraModel = require('../models/camera');

// **VALIDATION HELPER FUNCTIONS** - MOVE THESE TO TOP

// Basic IP address validation
function isValidIPAddress(ip) {
    // Simple IP validation (IPv4)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) return false;
    
    // Check each octet is between 0-255
    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
}

// IMPROVED Port number validation
function isValidPort(port) {
    // Remove any spaces and check if it's a valid number
    const cleanPort = port.toString().trim();
    
    // Check if it contains only numbers (no hyphens, letters, etc.)
    if (!/^\d+$/.test(cleanPort)) {
        return {
            isValid: false,
            error: 'Port must contain only numbers (1-65535). Remove any hyphens or letters.'
        };
    }
    
    const portNum = parseInt(cleanPort, 10);
    
    if (isNaN(portNum)) {
        return {
            isValid: false,
            error: 'Port must be a valid number (1-65535)'
        };
    }
    
    if (portNum < 1 || portNum > 65535) {
        return {
            isValid: false,
            error: 'Port number must be between 1 and 65535'
        };
    }
    
    return {
        isValid: true,
        portNumber: portNum
    };
}

module.exports = {
    CameraPost: async (req, res) => {
        console.log('req.body', req.body);
        try {
            // Map frontend field names to backend schema field names
            const {
                username,
                password,
                cameradetials,
                cameralocationname,
                cameralocationid,
                description,
                ipaddress,
                port,
                rtmp,
                cameravisibility = true
            } = req.body;

            // Map to backend schema field names
            const mappedData = {
                UserName: username ? username.trim() : undefined,
                Password: password ? password.trim() : undefined,
                CameraDetails: cameradetials ? cameradetials.trim() : undefined,
                CameraLocationName: cameralocationname ? cameralocationname.trim() : undefined,
                CameraLocationID: cameralocationid ? cameralocationid.trim() : undefined,
                LocationDescription: description ? description.trim() : undefined,
                IPAddress: ipaddress ? ipaddress.trim() : undefined,
                Port: port ? port.trim() : undefined,
                RTSPandRTMP: rtmp ? rtmp.trim() : undefined,
                CameraVisibility: cameravisibility
            };

            console.log('Mapped data:', mappedData);

            // **VALIDATION CHECKS BEFORE SAVING**

            // Validate IP Address format
            if (mappedData.IPAddress && !isValidIPAddress(mappedData.IPAddress)) {
                return res.status(400).json({ 
                    message: 'Please enter a valid IP address (e.g., 192.168.1.1)' 
                });
            }

            // Validate Port number - IMPROVED VALIDATION
            if (mappedData.Port) {
                const portValidation = isValidPort(mappedData.Port);
                if (!portValidation.isValid) {
                    return res.status(400).json({ 
                        message: portValidation.error 
                    });
                }
                // Convert to number for storage
                mappedData.Port = portValidation.portNumber.toString();
            }

            // Check for duplicate CameraLocationID
            if (mappedData.CameraLocationID) {
                const existingCameraLocation = await CameraModel.findOne({ 
                    CameraLocationID: mappedData.CameraLocationID 
                });
                if (existingCameraLocation) {
                    return res.status(409).json({ 
                        message: 'Camera Location ID already exists' 
                    });
                }
            }

            // Check for duplicate IPAddress
            if (mappedData.IPAddress) {
                const existingIPAddress = await CameraModel.findOne({ 
                    IPAddress: mappedData.IPAddress 
                });
                if (existingIPAddress) {
                    return res.status(409).json({ 
                        message: 'IP Address already exists' 
                    });
                }
            }

            const cameraData = new CameraModel(mappedData);
            await cameraData.save();
            
            return res.status(201).json({ 
                message: 'Camera registered successfully',
                data: cameraData 
            });
            
        } catch (error) {
            console.error('Camera post error:', error);
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                let fieldName = field === 'CameraLocationID' ? 'Camera Location ID' : 'IP Address';
                return res.status(409).json({ 
                    message: `${fieldName} already exists` 
                });
            }
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: errors.join(', ')
                });
            }

            return res.status(500).json({ 
                message: 'Internal Server Error', 
                error: error.message 
            });
        }
    },

    // ADD THE MISSING METHODS:

    CamereGet: async (req, res) => {
        try {
            const data = await CameraModel.find().sort({ createdAt: -1 });
            return res.status(200).json({ 
                message: 'Successfully retrieved camera data', 
                data 
            });
        } catch (err) {
            return res.status(500).json({ 
                message: 'Internal Server Error',
                error: err.message 
            });
        }
    },

    CamereUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                username,
                password,
                cameradetials,
                cameralocationname,
                cameralocationid,
                description,
                ipaddress,
                port,
                rtmp,
                cameravisibility
            } = req.body;

            // Map frontend fields to backend schema
            const data = {
                UserName: username ? username.trim() : undefined,
                Password: password ? password.trim() : undefined,
                CameraDetails: cameradetials ? cameradetials.trim() : undefined,
                CameraLocationName: cameralocationname ? cameralocationname.trim() : undefined,
                CameraLocationID: cameralocationid ? cameralocationid.trim() : undefined,
                LocationDescription: description ? description.trim() : undefined,
                IPAddress: ipaddress ? ipaddress.trim() : undefined,
                Port: port ? port.trim() : undefined,
                RTSPandRTMP: rtmp ? rtmp.trim() : undefined,
                CameraVisibility: cameravisibility
            };

            // Remove undefined fields
            Object.keys(data).forEach(key => {
                if (data[key] === undefined) {
                    delete data[key];
                }
            });

            console.log('Update mapped data:', data);

            // **VALIDATION CHECKS BEFORE UPDATING**
            if (data.IPAddress && !isValidIPAddress(data.IPAddress)) {
                return res.status(400).json({ 
                    message: 'Please enter a valid IP address (e.g., 192.168.1.1)' 
                });
            }

            if (data.Port) {
                const portValidation = isValidPort(data.Port);
                if (!portValidation.isValid) {
                    return res.status(400).json({ 
                        message: portValidation.error 
                    });
                }
                data.Port = portValidation.portNumber.toString();
            }

            // Check for duplicate CameraLocationID (excluding current document)
            if (data.CameraLocationID) {
                const existingCameraLocation = await CameraModel.findOne({ 
                    CameraLocationID: data.CameraLocationID,
                    _id: { $ne: id }
                });
                if (existingCameraLocation) {
                    return res.status(409).json({ 
                        message: 'Camera Location ID already exists' 
                    });
                }
            }

            // Check for duplicate IPAddress (excluding current document)
            if (data.IPAddress) {
                const existingIPAddress = await CameraModel.findOne({ 
                    IPAddress: data.IPAddress,
                    _id: { $ne: id }
                });
                if (existingIPAddress) {
                    return res.status(409).json({ 
                        message: 'IP Address already exists' 
                    });
                }
            }

            const updatedData = await CameraModel.findByIdAndUpdate(
                id, 
                data, 
                { 
                    new: true, 
                    runValidators: true 
                }
            );

            if (!updatedData) {
                return res.status(404).json({ 
                    message: 'Camera not found' 
                });
            }

            return res.status(200).json({ 
                message: 'Camera updated successfully', 
                data: updatedData 
            });

        } catch (error) {
            console.error('Camera update error:', error);
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                let fieldName = field === 'CameraLocationID' ? 'Camera Location ID' : 'IP Address';
                return res.status(409).json({ 
                    message: `${fieldName} already exists` 
                });
            }
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ 
                    message: 'Validation failed', 
                    errors: errors.join(', ')
                });
            }
            
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    message: 'Invalid camera ID' 
                });
            }

            return res.status(500).json({ 
                message: 'Internal Server Error',
                error: error.message 
            });
        }
    },

    CamereDelete: async (req, res) => {
        try {
            const { id } = req.params;
            
            const deletedCamera = await CameraModel.findByIdAndDelete(id);
            
            if (!deletedCamera) {
                return res.status(404).json({ 
                    message: 'Camera not found' 
                });
            }

            return res.status(200).json({ 
                message: 'Camera deleted successfully' 
            });

        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    message: 'Invalid camera ID' 
                });
            }
            
            return res.status(500).json({ 
                message: 'Internal Server Error',
                error: error.message 
            });
        }
    }
};