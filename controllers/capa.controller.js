const Capa = require("../models/capa.model");

exports.createCapa = async (req, res) => {
  const capa = await Capa.create(req.body);
  res.status(201).json(capa);
};

exports.getCapasByIncident = async (req, res) => {
  const data = await Capa.find({ incidentId: req.params.incidentId })
    .populate("assignedTo");

  res.json(data);
};

exports.updateCapaStatus = async (req, res) => {
  const capa = await Capa.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(capa);
};
