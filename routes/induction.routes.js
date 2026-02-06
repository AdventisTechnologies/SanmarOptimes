const router = require("express").Router();
const controller = require("../controllers/induction.controller");
const upload = require("../middleware/upload.middleware");

router.post("/", upload.single("certificate"), controller.createInduction);
router.get("/worker/:workerId", controller.getInductionsByWorker);

module.exports = router;
