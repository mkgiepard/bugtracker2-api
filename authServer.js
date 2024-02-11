require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

app.use(express.json());

// just for demo
let refreshTokens = [];
let users = [];

app.get("/auth", (req, res) => {
  res.json({ body: "hohoho" });
});

app.post("/auth/login", async (req, res) => {
  const user = users.find((user) => (user.username = req.body.username));
  console.log(req.body);
  if (user == null) {
    return res.status(400).send("Wrong user or password");
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken({ name: req.body.username });
      const refreshToken = jwt.sign({ name: req.body.username }, process.env.REFRESH_TOKEN_SECRET);
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
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/auth/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });
}

app.listen(4000);
