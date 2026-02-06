const Contractor = require("../models/contractor.model");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

/* ➕ CREATE CONTRACTOR (WITH IMAGE/S) */
exports.createContractor = async (req, res) => {
  try {
    // ✅ Normalize GST first
    if (typeof req.body.gstNumber === 'string') {
      req.body.gstNumber = req.body.gstNumber.trim().toUpperCase();
    }

    // ✅ Remove empty GST to avoid validation errors
    if (!req.body.gstNumber) {
      delete req.body.gstNumber;
    }

    const contractor = await Contractor.create(req.body);
    res.status(201).json(contractor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



/* 📄 GET ALL CONTRACTORS */
exports.getContractors = async (req, res) => {
  const data = await Contractor.find().sort({ createdAt: -1 });
  res.json(data);
};

/* 🚨 ADD INCIDENT (WITH IMAGE/S + RATING) */
exports.addIncident = async (req, res) => {
  try {
    const { contractorId } = req.params;

    const imageUrls = [];
    for (const file of req.files || []) {
      const url = await uploadToS3(file);
      imageUrls.push(url);
    }

    const contractor = await Contractor.findById(contractorId);
    if (!contractor)
      return res.status(404).json({ error: "Contractor not found" });

    const incidentData = {
      title: req.body.title,
      description: req.body.description,
      incidentDate: req.body.incidentDate,
      workType: req.body.workType,
      rating: Number(req.body.rating),
      images: imageUrls,
    };

    contractor.incidents.push(incidentData);

    // 🔁 Auto add work type history
    if (
      incidentData.workType &&
      !contractor.previousWorkTypes.includes(incidentData.workType)
    ) {
      contractor.previousWorkTypes.push(incidentData.workType);
    }

    contractor.calculateOverallRating();
    await contractor.save();

    res.json(contractor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ⭐ UPDATE INCIDENT RATING (OPTIONAL EDIT) */
exports.reviewIncident = async (req, res) => {
  try {
    const { contractorId, incidentId } = req.params;
    const { rating } = req.body;

    const contractor = await Contractor.findById(contractorId);
    if (!contractor)
      return res.status(404).json({ error: "Contractor not found" });

    const incident = contractor.incidents.id(incidentId);
    if (!incident)
      return res.status(404).json({ error: "Incident not found" });

    incident.rating = Number(rating);

    contractor.calculateOverallRating();
    await contractor.save();

    res.json(contractor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.uploadDocuments = async (req, res) => {
  try {
    const { contractorId } = req.params;
    const { type, expiryDate } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const contractorExists = await Contractor.findById(contractorId);
    if (!contractorExists) {
      return res.status(404).json({ message: "Contractor not found" });
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      const key = `contractors/${contractorId}/${uuidv4()}-${file.originalname}`;

      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();

      uploadedDocs.push({
        type,
        fileUrl: uploadResult.Location,
        expiryDate
      });
    }

    const contractor = await Contractor.findByIdAndUpdate(
      contractorId,
      {
        $push: { documents: { $each: uploadedDocs } }
      },
      { new: true }
    );

    res.status(200).json({
      message: "Documents uploaded successfully",
      documents: contractor.documents
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
