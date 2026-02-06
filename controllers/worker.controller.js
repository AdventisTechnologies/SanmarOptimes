const Worker = require("../models/worker.model");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

exports.createWorker = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);   // 🔍 DEBUG
    console.log("REQ FILE:", req.file);   // 🔍 DEBUG

    if (!req.body) {
      return res.status(400).json({ message: "No form data received" });
    }

    const worker = await Worker.create(req.body);
    res.status(201).json(worker);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



// ✅ Upload multiple images / documents
exports.uploadWorkerDocuments = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { type, expiryDate } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      const key = `workers/${workerId}/${uuidv4()}-${file.originalname}`;

      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();

      uploadedDocs.push({
        type: type || "OTHER",
        fileUrl: uploadResult.Location,
        expiryDate
      });
    }

    worker.documents.push(...uploadedDocs);
    await worker.save();

    res.json({
      message: "Worker documents uploaded",
      documents: worker.documents
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* 📄 GET ALL WORKERS */
exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
      .populate("contractorId", "companyName contractorCode")
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📄 GET WORKER BY ID */
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId)
      .populate("contractorId", "companyName contractorCode");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📄 GET ONLY WORKER DOCUMENTS */
exports.getWorkerDocuments = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId)
      .select("documents workerCode name");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker.documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
