const express = require("express");
const router = express.Router();
const controller = require("../controllers/contractor.controller");
const upload = require("../middleware/upload.middleware");

// CREATE contractor
router.post("/", controller.createContractor);

// GET all contractors ✅ FIXED
router.get("/", controller.getContractors);

// Upload documents (single or multiple)
router.post(
  "/:contractorId/documents",
  upload.array("files", 10),
  controller.uploadDocuments
);

module.exports = router;
