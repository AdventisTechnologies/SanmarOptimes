const router = require("express").Router();
const controller = require("../controllers/permit-type.controller");

router.post("/", controller.createPermitType);
router.get("/", controller.getPermitTypes);

module.exports = router;
