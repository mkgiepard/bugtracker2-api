require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");

// just for demo
let refreshTokens = [];

// move this to a single file and use for testing
let users = [
  {
    id: "1708258641158",
    username: "Mario",
    email: "one@one.co",
    password: process.env.TEST_USER_SECRET,
  },
];

const app = express();

require("./config/passport")(passport, (username) =>
  users.find((user) => (user.username = username))
);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/app/settings", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "SUCCESS: protected /settings route (4000)" });
});

app.post("/auth/login", async (req, res, next) => {
  const user = users.find((user) => user.username === req.body.username);
  console.log("login:");
  console.log(req.body);
  if (user == null) {
    return res.status(400).send("Wrong user or password");
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
});

app.post("/auth/register", async (req, res) => {
  try {
    console.log("register");
    hashedPassword = await bcrypt.hash(req.body.password, 12);
    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(200).send();
  } catch {
    res.status(500).send();
  }
  console.log(users);
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

app.listen(4000);
