const router = require("express").Router();
const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

router.get("/settings", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "SUCCESS: protected /settings route (3000)" });
});

router.get("/testing", (req, res) => {
  res.json({ msg: "SUCCESS: not protected /testing route (3000)" });
});

router.get("/users", passport.authenticate("jwt", { session: false }), (req, res) => {
  User.find({})
    .select(["-password", "-__v"])
    .then(async (users) => {
      return res.status(200).send(users);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/users/:username", passport.authenticate("jwt", { session: false }), (req, res) => {
  User.findOne({username: req.params.username})
    .select(["-password", "-__v"])
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ error: "User doesn't exist!" });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      next(err);
    });
});

router.put("/users/:username", passport.authenticate("jwt", { session: false }), async (req, res) => {
  console.log(req.body);
	User.findOne({ username: req.params.username })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ error: "User doesn't exist!" });
      }
  
      if (req.body.email) {
        user.email = req.body.email
      }
      if (req.body.firstName) {
        user.firstName = req.body.firstName
      }
      if (req.body.lastName) {
        user.lastName = req.body.lastName
      }

      user.save().then((user) => {
        const success = "User '" + user.username + "' successfully updated!";
        res.status(200).json({msg: success});
      })
    })
    .catch((err) => {next(err)});
});

router.delete("/users/:username", passport.authenticate("jwt", { session: false }), (req, res) => {
  User.deleteOne({username: req.params.username})
    .then((result) => {
      if (result.deletedCount == 1) {
        const success = "User '" + req.params.username + "' successfully deleted!";
        return res.status(200).send({msg: success});
      } else {
        return res.status(404).send({ error: "User doesn't exist!" });
      }
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
