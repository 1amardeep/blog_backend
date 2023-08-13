const mongoose = require("mongoose");

// Define a user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

module.exports = mongoose.model("User", userSchema);
