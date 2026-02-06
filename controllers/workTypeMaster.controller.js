const WorkTypeMaster = require('../models/workTypeMaster.model');

/**
 * CREATE or UPDATE (UPSERT)
 */
exports.saveWorkType = async (req, res) => {
  try {
    const { workType, activities, ppe, safetyDeclarations } = req.body;

    if (!workType) {
      return res.status(400).json({ message: 'workType is required' });
    }

    const saved = await WorkTypeMaster.findOneAndUpdate(
      { workType },
      {
        workType,
        activities: activities || [],
        ppe: ppe || [],
        safetyDeclarations: safetyDeclarations || []
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Work Type Master saved successfully',
      data: saved
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL WORK TYPES
 */
exports.getAllWorkTypes = async (req, res) => {
  try {
    const data = await WorkTypeMaster.find().sort({ workType: 1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SINGLE WORK TYPE BY ID
 */
exports.getWorkTypeById = async (req, res) => {
  try {
    const data = await WorkTypeMaster.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Work Type not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE WORK TYPE BY ID (NO UPSERT)
 */
exports.updateWorkType = async (req, res) => {
  try {
    const updated = await WorkTypeMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Work Type not found' });
    }

    res.status(200).json({
      message: 'Work Type updated successfully',
      data: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE WORK TYPE BY ID
 */
exports.deleteWorkType = async (req, res) => {
  try {
    const deleted = await WorkTypeMaster.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Work Type not found' });
    }

    res.status(200).json({
      message: 'Work Type deleted successfully'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
