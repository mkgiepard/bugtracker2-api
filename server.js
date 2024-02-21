require("dotenv").config();

const cors = require("cors");
const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");

// -------------------- SETUP -------------------- //
const app = express();

// MongoDB connection and models
require("./config/database");
require("./model/user");
const User = mongoose.model("User");

// Passport configuration and init
require("./config/passport")(passport, (username) => User.findOne({ username: username }));
app.use(passport.initialize());

// Use Express implementation for body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow Angular application to make HTTP requests to Express application
app.use(cors());

// -------------------- ROUTES -------------------- //
app.use(require("./routes"));

// -------------------- SERVER -------------------- //
app.listen(3000);
