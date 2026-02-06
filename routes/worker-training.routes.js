const express = require("express");
const router = express.Router();
const controller = require("../controllers/worker-training.controller");

// Assign training to worker
router.post("/", controller.assignTrainingToWorker);

// Get trainings of a worker
router.get("/worker/:workerId", async (req, res) => {
  const WorkerTraining = require("../models/worker-training.model");
  const data = await WorkerTraining.find({ workerId: req.params.workerId })
    .populate("trainingId");
  res.json(data);
});

module.exports = router;
