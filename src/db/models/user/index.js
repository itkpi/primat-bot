const config = require('config')
const mongoose = require('../../')
const postSave = require('./postSave')

const { Schema } = mongoose

const groupSchema = new Schema({
  groupId: Number,
  group: String,
  flow: String,
  groupOkr: String,
  groupType: String,
}, { _id: false })

const User = new Schema({
  tgId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: String,
  firstName: { type: String, required: true },
  lastName: String,
  group: {
    type: String,
    lowercase: true,
    // match: /^[А-яіє]{2,4}-[А-яіє]{0,2}[0-9]{2,3}[А-яіє]?\(?[А-яіє]*\)?\.?$/i,
    trim: true,
  },
  role: { type: String, required: true },
  groupId: Number,
  teacherId: Number,
  tName: String,
  tFullName: String,
  tShortName: String,
  tScheduleUrl: String,
  tRating: Number,
  groupOkr: String,
  groupType: String,
  groupScheduleUrl: String,
  flow: {
    type: String,
    lowercase: true,
    trim: true,
  },
  course: {
    type: Number,
    min: 1,
    max: 6,
    trim: true,
  },
  telegraph: {
    accessToken: String,
    authorName: String,
    authorUrl: String,
    authUrl: String,
    shortName: String,
    pageCount: Number,
  },
  settings: {
    [config.settings.scheduleLocationShowing]: { type: Boolean, default: true },
    [config.settings.abstractSubscriber]: { type: Boolean, default: true },
  },
  registeredWithSite: { type: Boolean, default: false },
  allowLectureUpload: { type: Boolean, default: false },
  masterGroup: groupSchema,
  bachelorGroup: groupSchema,
  upgradedGraduate: { type: Boolean, default: false },
}, { strict: 'throw', timestamps: true })

User.post('save', postSave)

const Model = mongoose.model('User', User)
Model.ensureIndexes()

module.exports = Model
