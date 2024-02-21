const router = require("express").Router();
const passport = require("passport");

router.get("/settings", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "SUCCESS: protected /settings route (3000)" });
});

module.exports = router;
