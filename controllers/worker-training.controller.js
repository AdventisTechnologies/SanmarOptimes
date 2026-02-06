const WorkerTraining = require("../models/worker-training.model");
const Training = require("../models/training.model");

exports.assignTrainingToWorker = async (req, res) => {
       console.log("TRAINING PAYLOAD:", req.body);
  const training = await Training.findById(req.body.trainingId);

  if (!training) {
    return res.status(400).json({ message: "Training not found" });
  }

  const completedOn = new Date(req.body.completedOn);
  const validTo = new Date(completedOn);
  validTo.setDate(validTo.getDate() + training.validityDays);

  const workerTraining = await WorkerTraining.create({
    workerId: req.body.workerId,
    trainingId: req.body.trainingId,
    completedOn,
    validTo,
    score: req.body.score,
    status: "VALID"
  });

  res.json(workerTraining);
};
