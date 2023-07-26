const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  category: {
    required: true,
    type: String,
  },
  date: {
    require: true,
    type: Date,
  },
});

module.exports = mongoose.model("Question", questionSchema);
