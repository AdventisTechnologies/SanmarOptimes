const router = require("express").Router();
const controller = require("../controllers/site-entry.controller");

router.post("/entry", controller.attemptEntry);
router.patch("/exit/:entryId", controller.exitWorker);
router.get("/", controller.getEntries);

module.exports = router;
