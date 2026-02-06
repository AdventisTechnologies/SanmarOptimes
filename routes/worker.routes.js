const express = require("express");
const router = express.Router();
const controller = require("../controllers/worker.controller");
const upload = require("../middleware/upload.middleware");


// Get all workers
router.get("/", controller.getWorkers);

// Get single worker
router.get("/:workerId", controller.getWorkerById);

// Create worker (no files here)
router.post(
  "/",
  upload.single("photo"),   // 🔥 ADD THIS
  controller.createWorker
);

// Upload multiple documents/images
router.post(
  "/:workerId/documents",
  upload.array("files", 10),
  controller.uploadWorkerDocuments
);

module.exports = router;
