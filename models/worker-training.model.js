const mongoose = require("mongoose");

const WorkerTrainingSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
  trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training" },
  completedOn: Date,
  validTo: Date,
  score: Number,
  status: {
    type: String,
    enum: ["VALID", "EXPIRED"],
    default: "VALID"
  }
}, { timestamps: true });

module.exports = mongoose.model("WorkerTraining", WorkerTrainingSchema);
