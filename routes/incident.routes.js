const router = require("express").Router();
const controller = require("../controllers/incident.controller");

router.post("/", controller.createIncident);
router.get("/", controller.getIncidents);
router.get("/:id", controller.getIncidentById);
router.patch("/:id/status", controller.updateIncidentStatus);

module.exports = router;
