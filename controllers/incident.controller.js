const Incident = require("../models/incident.model");

exports.createIncident = async (req, res) => {
  const incident = await Incident.create(req.body);
  res.status(201).json(incident);
};

exports.getIncidents = async (req, res) => {
  const data = await Incident.find()
    .populate("contractorId workerId reportedBy")
    .sort({ createdAt: -1 });

  res.json(data);
};

exports.getIncidentById = async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate("contractorId workerId reportedBy");

  res.json(incident);
};

exports.updateIncidentStatus = async (req, res) => {
  const incident = await Incident.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(incident);
};
