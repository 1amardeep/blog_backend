const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  value: {
    required: true,
    type: String,
  },
  viewValue: {
    required: true,
    type: String,
  },
  color: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model("Category", categorySchema);
