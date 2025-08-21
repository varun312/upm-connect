const mongoose = require("mongoose");

const voterCardsSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  voterIdImage: { type: String, required: true },
});

const passportSchema = new mongoose.Schema({
  passportId: { type: String, required: true, unique: true },
  passportImage: { type: String, required: true },
});

const VoterCardInfo = mongoose.model("VoterCardInfo", voterCardsSchema);
const PassportInfo = mongoose.model("PassportInfo", passportSchema);

module.exports = {
  VoterCardInfo,
  PassportInfo,
};
