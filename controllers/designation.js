const DesignationModel = require('../models/designation');

module.exports = {
    DesignationDetailspost: async (req, res) => {
        try {
            const { designation } = req.body;
            
            // Validate input
            if (!designation || designation.trim() === '') {
                return res.status(400).json({ 
                    message: 'Designation name is required' 
                });
            }

            // Check if designation already exists
            const existingDesignation = await DesignationModel.findOne({ 
                designation: designation.trim() 
            });
            
            if (existingDesignation) {
                return res.status(409).json({ 
                    message: 'Designation already exists' 
                });
            }

            const result = new DesignationModel({
                designation: designation.trim(),
            });

            await result.save();
            return res.status(201).json({ 
                message: 'Success', 
                data: result 
            });

        } catch (err) {
            if (err.code === 11000) { // MongoDB duplicate key error
                return res.status(409).json({
                    message: 'Designation already exists',
                    error: err.message
                });
            }
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    },

    DesignationDetailsget: async (req, res) => {
        try {
            const result = await DesignationModel.find().sort({ designation: 1 }); // Sort alphabetically
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    },

    DesignationDetailsupdate: async (req, res) => {
        const { id } = req.params;
        const { designation } = req.body;

        try {
            // Validate input
            if (!designation || designation.trim() === '') {
                return res.status(400).json({ 
                    message: 'Designation name is required' 
                });
            }

            // Check if new designation name already exists (excluding current document)
            const existingDesignation = await DesignationModel.findOne({
                designation: designation.trim(),
                _id: { $ne: id }
            });

            if (existingDesignation) {
                return res.status(409).json({ 
                    message: 'Designation name already exists' 
                });
            }

            const updatedDesignation = await DesignationModel.findByIdAndUpdate(
                id, 
                { designation: designation.trim() }, 
                { new: true, runValidators: true }
            );

            if (!updatedDesignation) {
                return res.status(404).json({ 
                    message: 'Designation not found' 
                });
            }

            return res.status(200).json({ 
                message: 'Designation updated successfully',
                data: updatedDesignation 
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ 
                    message: 'Designation name already exists',
                    error: error.message 
                });
            }
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    message: 'Invalid designation ID' 
                });
            }
            return res.status(500).json({ 
                message: 'Internal server error',
                error: error.message 
            });
        }
    },

    DesignationDetailsdelete: async (req, res) => {
        try {
            const { id } = req.params;
            
            const deletedDesignation = await DesignationModel.findByIdAndDelete(id);
            
            if (!deletedDesignation) {
                return res.status(404).json({ 
                    message: 'Designation not found' 
                });
            }

            return res.status(200).json({ 
                message: 'Designation deleted successfully' 
            });

        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(400).json({ 
                    message: 'Invalid designation ID' 
                });
            }
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    }
};