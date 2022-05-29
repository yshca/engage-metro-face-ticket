const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    source: {
      type: Number,
    },
    destination: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
