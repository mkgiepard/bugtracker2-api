require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");

const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/usersdb");
}

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

mongoose.model("User", UserSchema);

const User = mongoose.model("User");

// just for demo
let refreshTokens = [];

const app = express();

require("./config/passport")(passport, (username) => User.findOne({ username: username }));

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/app/settings", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "SUCCESS: protected /settings route (3000)" });
});

app.post("/auth/login", (req, res, next) => {
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
          res.send("Wrong user or password");
        }
      } catch {
        res.status(500).send();
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.post("/auth/register", async (req, res) => {
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);

    const newUser = new User({
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    newUser.save().then((user) => {
      res.status(200).send();
    });
  } catch {
    res.status(500).send();
  }
});

app.post("/auth/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/auth/logout", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "300s" });
}

app.listen(3000);
