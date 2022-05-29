const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const maskSchema = new Schema(
  {
    email: {
      type: String,
    },
    descriptors: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mask", maskSchema);
