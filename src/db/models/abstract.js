const config = require('config')
const mongoose = require('../')
const User = require('./user')
const { telegram } = require('../../modules/telegraf')
const logger = require('../../utils/logger')
const extractUsername = require('../../utils/extractUsername')

const { Schema } = mongoose
const Abstract = new Schema({
  text: String,
  url: { type: String, required: true },
  flow: { type: String, required: true },
  path: { type: String, required: true },
  title: { type: String, required: true },
  course: { type: Number, required: true },
  subject: { type: String, required: true },
  authorId: { type: String, required: true },
  semester: { type: Number, required: true },
  storedPhotos: { type: Array, default: [] },
  photos: { type: Array, default: [] },
}, { versionKey: false, timestamps: true, strict: 'throw' })

Abstract.index({
  flow: 1,
  course: 1,
  semester: 1,
  subject: 1,
})

Abstract.post('save', async data => {
  const {
    flow,
    course,
    semester,
    authorId,
    subject,
    url,
    title,
  } = data
  logger.info(`${authorId} has saved new lecture`
    + `[${flow}, ${course} course, ${semester} semester]: ${subject} | ${title}`)
  const groupmatesQuery = {
    flow,
    course,
    [`settings.${config.settings.abstractSubscriber}`]: true,
    tgId: { $ne: authorId },
  }
  const allStudentsQuery = {
    [`settings.${config.settings.abstractSubscriberGlobal}`]: true,
    role: config.roles.student,
    tgId: { $ne: authorId },
  }
  const tasks = [
    User.findOne({ tgId: authorId }), User.find(groupmatesQuery), User.find(allStudentsQuery)]
  const [author, users, allUsers] = await Promise.all(tasks)
  const msg = `${extractUsername(author)} сохранил лекцию по предмету ${subject}\n\n${url}`
  users.forEach(({ tgId }) => telegram.sendMessage(tgId, msg))
  allUsers.forEach(({ tgId }) => telegram.sendMessage(tgId, msg))
})

const Model = mongoose.model('Abstract', Abstract)
Model.ensureIndexes()

module.exports = Model
