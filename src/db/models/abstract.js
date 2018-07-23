const config = require('config')
const mongoose = require('../')
const User = require('./user')
const { telegram } = require('../../modules/telegraf')
const logger = require('../../utils/logger')

const { Schema } = mongoose
const Abstract = new Schema({
  subject: { type: String, required: true },
  name: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  text: String,
  telegraph_url: { type: String, required: true },
  telegraph_path: { type: String, required: true },
  telegraph_title: { type: String, required: true },
  course: { type: Number, required: true },
  semester: { type: Number, required: true },
  flow: { type: String, required: true },
}, { versionKey: false, timestamps: true })

if (process.env.NODE_ENV === 'production') {
  Abstract.post('save', async data => {
    const {
      flow,
      course,
      semester,
      authorId,
      author,
      subject,
      telegraphUrl,
      name,
    } = data
    logger.info(`${author || authorId} has saved new lecture [${flow}, ${course} course, ${semester} semester]: ${subject} | ${name}`)
    const users = await User.find({
      flow,
      course,
      [`settings.${config.settings.abstractSubscriber}`]: true,
      tgId: { $ne: authorId },
    })

    const msg = `${author} сохранил лекцию по предмету ${subject} <a href="${telegraphUrl}">здесь</a>`
    users.forEach(({ tgId }) => telegram.sendMessage(tgId, msg, { parse_mode: 'HTML' }))
  })
}

module.exports = mongoose.model('Abstract', Abstract)
