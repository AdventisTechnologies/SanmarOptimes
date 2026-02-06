const router = require("express").Router();
const controller = require("../controllers/training.controller");

router.post("/", controller.createTraining);
router.get("/", controller.getTrainings);
router.delete("/:id", controller.deleteTraining);

module.exports = router;
