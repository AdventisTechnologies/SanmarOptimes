const PpeMaster = require("../models/ppe-master.model");

/* ➕ CREATE PPE */
exports.createPpe = async (req, res) => {
  try {
    const ppe = await PpeMaster.create(req.body);
    res.status(201).json(ppe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* 📄 GET ALL PPEs */
exports.getPpes = async (req, res) => {
  try {
    const ppes = await PpeMaster.find({ status: "ACTIVE" })
      .sort({ createdAt: -1 });

    res.json(ppes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✏️ UPDATE PPE */
exports.updatePpe = async (req, res) => {
  try {
    const ppe = await PpeMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!ppe) {
      return res.status(404).json({ message: "PPE not found" });
    }

    res.json(ppe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ❌ SOFT DELETE PPE */
exports.deletePpe = async (req, res) => {
  try {
    const ppe = await PpeMaster.findByIdAndUpdate(
      req.params.id,
      { status: "INACTIVE" },
      { new: true }
    );

    if (!ppe) {
      return res.status(404).json({ message: "PPE not found" });
    }

    res.json({ message: "PPE deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deactivatePpe = async (req, res) => {
  const ppe = await PpeMaster.findByIdAndUpdate(
    req.params.id,
    { status: "INACTIVE" },
    { new: true }
  );

  if (!ppe) {
    return res.status(404).json({ message: "PPE not found" });
  }

  res.json({ message: "PPE deactivated", ppe });
};
