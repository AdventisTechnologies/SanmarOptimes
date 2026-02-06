const Training = require("../models/training.model");

/* CREATE TRAINING */
exports.createTraining = async (req, res) => {
  try {
    const training = await Training.create(req.body);
    res.status(201).json(training);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* GET ALL TRAININGS */
exports.getTrainings = async (req, res) => {
  const data = await Training.find().sort({ createdAt: -1 });
  res.json(data);
};

/* DELETE TRAINING (optional) */
exports.deleteTraining = async (req, res) => {
  await Training.findByIdAndDelete(req.params.id);
  res.json({ message: "Training deleted" });
};
