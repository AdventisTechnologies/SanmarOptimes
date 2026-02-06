const express = require("express");
const router = express.Router();
const controller = require("../controllers/ppe-issue.controller");

// Issue PPE to worker
router.post("/", controller.issuePpe);

// Get PPEs issued to a worker
router.get("/worker/:workerId", controller.getWorkerPpes);

// Update PPE status (EXPIRED / LOST)
router.patch("/:issueId/status", controller.updatePpeStatus);


module.exports = router;
