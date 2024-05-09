const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  token: String,
});

mongoose.model("Token", TokenSchema);
