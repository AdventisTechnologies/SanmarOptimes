const router = require("express").Router();
const controller = require("../controllers/permit.controller");

router.post("/", controller.createPermit);
router.get("/", controller.getPermits);
router.get("/:id", controller.getPermitById);
router.patch("/:id/status", controller.updatePermitStatus);
router.patch("/:id/workers", controller.assignWorkersToPermit);

module.exports = router;
