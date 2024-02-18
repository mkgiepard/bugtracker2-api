require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const passport = require("passport");

// move this to a single file and use for testing
let users = [
  {
    id: "1708258641158",
    username: "Mario",
    email: "one@one.co",
    password: process.env.TEST_USER_SECRET,
  },
];

require("./config/passport")(passport, (username) =>
  users.find((user) => (user.username = username))
);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const posts = [
  {
    username: "Mario",
    title: "Post 1",
  },
  {
    username: "Bros",
    title: "Post 2",
  },
];

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.name));
});

app.get("/app/settings", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ msg: "SUCCESS: protected /settings route (3000)" });
});

// Middleware for token authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3000);
