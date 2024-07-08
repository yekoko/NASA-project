const mongoose = require("mongoose");

const platnetsSchema = new mongoose.Schema({
  keplerName: { type: String, required: true },
});

module.exports = mongoose.model("Planet", platnetsSchema);
