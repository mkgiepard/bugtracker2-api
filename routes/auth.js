const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();

const User = mongoose.model("User");

// just for demo
let refreshTokens = [];

router.post("/login", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then(async (user) => {
      console.log(user);
      if (!user) {
        return res.status(401).send("Wrong user or password");
      }
      try {
        if (await bcrypt.compare(req.body.password, user.password)) {
          const accessToken = generateAccessToken({ username: req.body.username });
          const refreshToken = jwt.sign(
            { username: req.body.username },
            process.env.REFRESH_TOKEN_SECRET
          );
          refreshTokens.push(refreshToken);
          res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
          res.status(401).json({ error: "Wrong user or password" });
        }
      } catch {
        res.status(500).send();
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/register", async (req, res) => {
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);

    const newUser = new User({
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    newUser.save().then((user) => {
      const success = "User '" + user.username + "' successfully registered!";
      res.status(200).json({msg: success});
    });
  } catch {
    res.status(500).send();
  }
});

router.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.name });
    res.json({ accessToken: accessToken });
  });
});

router.delete("/logout", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "300s" });
}

module.exports = router;
