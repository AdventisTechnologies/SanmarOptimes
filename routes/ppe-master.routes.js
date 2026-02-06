const express = require("express");
const router = express.Router();
const controller = require("../controllers/ppe-master.controller");

// ➕ Create PPE master
router.post("/", controller.createPpe);

// 📄 Get all PPE masters
router.get("/", controller.getPpes);

// ✏️ Update PPE master
router.put("/:id", controller.updatePpe);

// ❌ Deactivate (soft delete) PPE master
router.delete("/:id", controller.deletePpe);

router.patch("/:id/deactivate", controller.deactivatePpe);


module.exports = router;
