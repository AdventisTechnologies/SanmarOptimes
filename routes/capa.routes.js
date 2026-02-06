const router = require("express").Router();
const controller = require("../controllers/capa.controller");

router.post("/", controller.createCapa);
router.get("/incident/:incidentId", controller.getCapasByIncident);
router.patch("/:id/status", controller.updateCapaStatus);

module.exports = router;
