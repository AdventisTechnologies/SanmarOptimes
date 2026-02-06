const Induction = require("../models/induction.model");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

/* ➕ CREATE INDUCTION */
exports.createInduction = async (req, res) => {
  try {
    let certificateUrl = "";

    /* 📄 UPLOAD CERTIFICATE (OPTIONAL) */
    if (req.file) {
      const key = `inductions/${uuidv4()}-${req.file.originalname}`;

      const upload = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      }).promise();

      certificateUrl = upload.Location;
    }

    /* 📅 AUTO CALCULATE validTo (if validityDays provided) */
    let validTo = req.body.validTo;

    if (req.body.validityDays && !req.body.validTo) {
      const from = req.body.validFrom
        ? new Date(req.body.validFrom)
        : new Date();

      validTo = new Date(from);
      validTo.setDate(validTo.getDate() + Number(req.body.validityDays));
    }

    /* 🧠 AUTO RESULT BASED ON SCORE */
    let result = req.body.result;
    if (req.body.score !== undefined) {
      const passMark = req.body.passMark || 60;
      result = Number(req.body.score) >= passMark ? "PASS" : "FAIL";
    }

    const induction = await Induction.create({
      ...req.body,
      validTo,
      result,
      certificateUrl
    });

    res.status(201).json(induction);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

/* 📄 GET INDUCTIONS BY WORKER */
exports.getInductionsByWorker = async (req, res) => {
  try {
    const data = await Induction.find({
      workerId: req.params.workerId
    })
      .populate("conductedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
