const PermitType = require("../models/permit-type.model");

exports.createPermitType = async (req, res) => {
  const permitType = await PermitType.create(req.body);
  res.status(201).json(permitType);
};

exports.getPermitTypes = async (req, res) => {
  const data = await PermitType.find().populate("requiredPPE");
  res.json(data);
};
