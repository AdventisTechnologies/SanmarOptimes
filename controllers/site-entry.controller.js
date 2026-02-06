const SiteEntry = require("../models/site-entry.model");
const Induction = require("../models/induction.model");
const PpeIssue = require("../models/ppe-issue.model");
const Permit = require("../models/permit.model");

exports.attemptEntry = async (req, res) => {
  try {
    const { workerId, contractorId, gateId } = req.body;

    /* 1️⃣ INDUCTION CHECK */
    const inductionValid = await Induction.exists({
      workerId,
      validTo: { $gte: new Date() }
    });

    /* 2️⃣ MEDICAL CHECK (TEMP: TRUE) */
    const medicalValid = true;

    /* 3️⃣ PPE CHECK */
    const ppeValid = await PpeIssue.exists({
      workerId,
      status: "ACTIVE"
    });

    /* 4️⃣ PERMIT CHECK (IMPORTANT FIX) */
    const permitValid = await Permit.exists({
      contractorId,
      workers: workerId,            // 🔥 REQUIRED
      status: "APPROVED",
      validTo: { $gte: new Date() }
    });

    /* 5️⃣ FINAL DECISION */
    const entryAllowed =
      !!inductionValid &&
      medicalValid &&
      !!ppeValid &&
      !!permitValid;

    const entry = await SiteEntry.create({
      workerId,
      contractorId,
      gateId,                       // STRING is fine
      entryTime: new Date(),        // 🔥 ADD THIS
      validationResult: {
        induction: !!inductionValid,
        medical: medicalValid,
        ppe: !!ppeValid,
        permit: !!permitValid
      },
      entryAllowed
    });

    res.json(entry);
  } catch (err) {
    console.error("ENTRY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.exitWorker = async (req, res) => {
  const entry = await SiteEntry.findByIdAndUpdate(
    req.params.entryId,
    { exitTime: new Date() },
    { new: true }
  );

  res.json(entry);
};

exports.exitWorker = async (req, res) => {
  const entry = await SiteEntry.findByIdAndUpdate(
    req.params.entryId,
    { exitTime: new Date() },
    { new: true }
  );

  res.json(entry);
};

exports.getEntries = async (req, res) => {
  const data = await SiteEntry.find()
    .populate("workerId contractorId") // ❌ REMOVE gateId
    .sort({ createdAt: -1 });

  res.json(data);
};