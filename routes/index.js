const router = require("express").Router();

router.use("/app", require("./app"));
router.use("/auth", require("./auth"));

module.exports = router;
