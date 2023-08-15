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
  color: {
    required: true,
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sharedLevel: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Question", questionSchema);
