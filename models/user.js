const mongoose = require('../modules/mongoose'),

  Schema = mongoose.Schema,

  User = new Schema({
    tgId: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String
    },
    group: {
      type: String,
      lowercase: true,
      match: /^[А-яіє]{2,4}-?[А-яіє]{0,2}[0-9]{2,3}[А-яіє]?\(?[А-яіє]*\)?\.?$/i,
      trim: true
    },
    groupHubId: {
      type: Number
    },
    flow: {
      type: String,
      lowercase: true,
      trim: true
    },
    course: {
      type: Number,
      min: 1,
      max: 6,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    telegraph_token: {
      type: String
    },
    telegraph_authurl: {
      type: String
    },
    telegraph_user: Boolean,
    unsubscriber: Boolean
  })

module.exports = mongoose.model('User', User)