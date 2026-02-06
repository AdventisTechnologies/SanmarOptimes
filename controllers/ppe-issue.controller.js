const PpeIssue = require("../models/ppe-issue.model");

/* 🧤 ISSUE PPE TO WORKER */
exports.issuePpe = async (req, res) => {
  try {
    console.log("PPE PAYLOAD:", req.body);

    const {
      workerId,
      ppeId,
      issuedOn,
      expiryDate,
      issuedBy,
      quantity,
      sizeIssued,
      issueReason,
      siteId,
      jobRole,
      remarks
    } = req.body;

    if (!workerId || !ppeId) {
      return res.status(400).json({
        message: "workerId and ppeId are required"
      });
    }

const issue = await PpeIssue.create({
  workerId,
  ppeId,
  issuedOn: issuedOn || new Date(),
  expiryDate,

  // ✅ DO NOT USE req.body.issuedBy
  issuedBy: null,   // or req.user._id later

  quantity: quantity || 1,
  sizeIssued,
  issueReason: issueReason || "NEW_JOINING",
  siteId,
  jobRole,
  status: "ACTIVE",
  remarks
});



    res.status(201).json(issue);

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

/* 📄 GET ALL PPEs ISSUED TO A WORKER */
exports.getWorkerPpes = async (req, res) => {
  try {
    const data = await PpeIssue.find({
      workerId: req.params.workerId
    })
      .populate("ppeId", "ppeName ppeType expiryRequired")
      .sort({ issuedOn: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 🔁 MARK PPE AS RETURNED / LOST / EXPIRED */
exports.updatePpeStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, conditionOnReturn, remarks } = req.body;

    const issue = await PpeIssue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "PPE Issue not found" });
    }

    issue.status = status;

    if (status === "RETURNED") {
      issue.returnedOn = new Date();
      issue.conditionOnReturn = conditionOnReturn;
    }

    if (remarks) {
      issue.remarks = remarks;
    }

    await issue.save();

    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePpeStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const issue = await PpeIssue.findByIdAndUpdate(
      issueId,
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: "PPE Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
