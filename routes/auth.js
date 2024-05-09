const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();

const User = mongoose.model("User");
const Token = mongoose.model("Token");

// just for demo
let refreshTokens = [];

router.post("/login", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then(async (user) => {
      console.log(user);
      if (!user) {
        return res.status(401).send({ error: "Wrong user or password" });
      }
      try {
        if (await bcrypt.compare(req.body.password, user.password)) {
          const accessToken = generateAccessToken({ username: req.body.username });
          const refreshToken = jwt.sign(
            { username: req.body.username },
            process.env.REFRESH_TOKEN_SECRET
          );
          refreshTokens.push(refreshToken);
          
          const newToken = new Token({token: refreshToken});
          newToken.save().catch((err) => {
              console.log(err);
          });

          res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
          res.status(401).json({ error: "Wrong user or password" });
        }
      } catch {
        res.status(500).send();
      }
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.post("/register", async (req, res) => {
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);

    const newUserData = {
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    };

    if (req.body.firstName) {
      newUserData.firstName = req.body.firstName;
    }

    if (req.body.lastName) {
      newUserData.lastName = req.body.lastName;
    }

    const newUser = new User(newUserData);
    newUser
      .save()
      .then((user) => {
        const success = "User '" + user.username + "' successfully registered!";
        res.status(200).json({ msg: success });
      })
      .catch((err) => {
        if (err.name === "MongoServerError" && err.code === 11000) {
          res.status(409).send({ error: "User with this username already exists!" });
        } else {
          res.status(500).send(err.name + ": " + err.code);
        }
      });
  } catch (err) {
    res.status(500).send(err.name + ": " + err.code);
  }
});

router.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);

  Token.findOne({ token: refreshToken })
    .then((t) => {
      if (!t) return res.sendStatus(403);

      jwt.verify(t.token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ username: user.name });
        res.json({ accessToken: accessToken });
      });
    })
    .catch((err) => {
      next(err);
    });

  
});

router.delete("/logout", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  Token.deleteOne({ token: req.body.token })
    .then((result) => {
      if (result.deletedCount == 1) {
        return res.status(204).send();
      }
    })
    .catch((err) => {
      next(err);
    });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3000s" });
}

module.exports = router;
