const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  username: String,
  token: String,
});

mongoose.model("Token", TokenSchema);
