const Permit = require("../models/permit.model");

exports.createPermit = async (req, res) => {
  const permit = await Permit.create(req.body);
  res.status(201).json(permit);
};

exports.getPermits = async (req, res) => {
  const data = await Permit.find()
    .populate("permitTypeId contractorId workers")
    .sort({ createdAt: -1 });

  res.json(data);
};

exports.getPermitById = async (req, res) => {
  const permit = await Permit.findById(req.params.id)
    .populate("permitTypeId contractorId workers");

  res.json(permit);
};

exports.updatePermitStatus = async (req, res) => {
  const permit = await Permit.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(permit);
};
exports.assignWorkersToPermit = async (req, res) => {
  const { workers } = req.body;

  if (!Array.isArray(workers) || workers.length === 0) {
    return res.status(400).json({ message: "Workers array required" });
  }

  const permit = await Permit.findByIdAndUpdate(
    req.params.id,
    { workers },
    { new: true }
  ).populate("workers");

  res.json(permit);
};

