const mongoose = require('../')

const { Schema } = mongoose
const Chat = new Schema({
  tgId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: { type: String, required: true },
  type: { type: String, required: true },
  allMembersAreAdministrators: { type: Boolean, required: true },
  inviter: Schema.Types.Mixed,
}, { timestamps: true })

const Model = mongoose.model('Chat', Chat)
Model.ensureIndexes()

module.exports = Model
