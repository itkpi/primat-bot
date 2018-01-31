const mongoose = require('../modules/mongoose'),
    User = require('./user'),
    { telegram } = require('../modules/utils').bot

const Schema = mongoose.Schema,

    Abstract = new Schema({
        subject: { type: String, required: true },
        name: { type: String, required: true },
        author: { type: String, required: true },
        authorId: { type: String, required: true },
        text: String,
        source: String,
        telegraph_url: { type: String, required: true},
        telegraph_path: { type: String, required: true },
        telegraph_title: { type: String, required: true },
        course: { type: Number, required: true },
        semester: { type: Number, required: true },
        flow: { type: String, required: true },
        date: { type: Date, default: Date.now }
    })

if (process.env.STATUS === 'prod') {
    Abstract.post('save', async ({ flow, course, authorId, author, subject, telegraph_url }) => {
        const msg = `${author} сохранил лекцию по предмету ${subject}\n${telegraph_url}\n(/unsub чтобы отписаться)`,
          users = await User.find({
            flow,
            course, 
            $or: [{ unsubscriber: {$exists: false} }, { unsubscriber: false }],
            tgId: { $ne: authorId }
          })

        users.forEach(({ tgId }) => telegram.sendMessage(tgId, msg))
    })
}

module.exports = mongoose.model('Abstract', Abstract)