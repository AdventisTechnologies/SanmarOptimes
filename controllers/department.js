const DepartmentModel = require('../models/department');

module.exports = {
    DepartmentDetailspost: async (req, res) => {
        try {
            const { department } = req.body;
            
            if (!department || department.trim() === '') {
                return res.status(400).json({ 
                    message: 'Department name is required' 
                });
            }

            const existingDepartment = await DepartmentModel.findOne({ 
                department: department.trim() 
            });
            
            if (existingDepartment) {
                return res.status(409).json({ 
                    message: 'Department already exists' 
                });
            }

            const result = new DepartmentModel({
                department: department.trim(),
            });

            await result.save();
            return res.status(201).json({ 
                message: 'Success', 
                data: result 
            });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({
                    message: 'Department already exists',
                    error: err.message
                });
            }
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    },

    DepartmentDetailsget: async (req, res) => {
        try {
            const result = await DepartmentModel.find().sort({ department: 1 });
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    },

    DepartmentDetailsupdate: async (req, res) => {
        const { id } = req.params;
        const { department } = req.body;

        try {
            if (!department || department.trim() === '') {
                return res.status(400).json({ 
                    message: 'Department name is required' 
                });
            }

            const existingDepartment = await DepartmentModel.findOne({
                department: department.trim(),
                _id: { $ne: id }
            });

            if (existingDepartment) {
                return res.status(409).json({ 
                    message: 'Department name already exists' 
                });
            }

            const updatedDepartment = await DepartmentModel.findByIdAndUpdate(
                id, 
                { department: department.trim() }, 
                { new: true, runValidators: true }
            );

            if (!updatedDepartment) {
                return res.status(404).json({ 
                    message: 'Department not found' 
                });
            }

            return res.status(200).json({ 
                message: 'Department updated successfully',
                data: updatedDepartment 
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ 
                    message: 'Department name already exists',
                    error: error.message 
                });
            }
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    message: 'Invalid department ID' 
                });
            }
            return res.status(500).json({ 
                message: 'Internal server error',
                error: error.message 
            });
        }
    },

    DepartmentDetailsdelete: async (req, res) => {
        try {
            const { id } = req.params;
            
            const deletedDepartment = await DepartmentModel.findByIdAndDelete(id);
            
            if (!deletedDepartment) {
                return res.status(404).json({ 
                    message: 'Department not found' 
                });
            }

            return res.status(200).json({ 
                message: 'Department deleted successfully' 
            });

        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(400).json({ 
                    message: 'Invalid department ID' 
                });
            }
            return res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    }
};