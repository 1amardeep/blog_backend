const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Blog", blogSchema);
