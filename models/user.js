const mongoose = require('../modules/mongoose'),
      { telegram } = require('../modules/utils').bot,
      config = require('../config'),

      Schema = mongoose.Schema,

      User = new Schema({
        tgId: {
          type: String,
          required: true,
          unique: true
        },
        username: String,
        group: {
          type: String,
          lowercase: true,
          // match: /^[А-яіє]{2,4}-[А-яіє]{0,2}[0-9]{2,3}[А-яіє]?\(?[А-яіє]*\)?\.?$/i,
          trim: true
        },
        groupHubId: Number,
        rGroupId: Number,
        notKPI: { type: Boolean, default: false },
        isStudent: { type: Boolean, default: false },
        isAbitura: { type: Boolean, default: false },
        isTeacher: { type: Boolean, default: false },
        teacherId: Number,
        teacherName: String,
        teacherFullName: String,
        teacherShortName: String,
        teacherScheduleUrl: String,
        teacherRating: Number,
        groupOkr: String,
        groupType: String,
        groupScheduleUrl: String,
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
          required: true,
          default: Date.now
        },
        telegraph_token: String,
        telegraph_authurl: String,
        telegraph_user: Boolean,
        unsubscriber: Boolean,
        hideLocationBtns: { type: Boolean, default: false }
      })

User.post('save', ({ username, tgId, group }) => {
  console.log(username, tgId, group)
  const msg = `New user ${username || tgId}${group ? ` from ${group}` : ''} has registered!`
  telegram.sendMessage(config.ownerId, msg)
  console.log(msg)

  const links = Object.keys(config.start_links)
  const info = links.map(link => `<a href="${link}">Здесь</a> ${config.start_links[link]}`)
    .join('\n')
  telegram.sendMessage(tgId, info, { parse_mode: 'HTML' })
})

module.exports = mongoose.model('User', User)
