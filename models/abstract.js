const mongoose = require('../modules/mongoose')

const Schema = mongoose.Schema,

    Abstract = new Schema({
        subject: { type: String, required: true },
        name: { type: String, required: true },
        author: { type: String, required: true },
        authorId: { type: String, required: true },
        text: String,
        telegraph_url: { type: String, required: true},
        telegraph_path: { type: String, required: true },
        telegraph_title: { type: String, required: true },
        course: { type: Number, required: true },
        semester: { type: Number, required: true },
        flow: { type: String, required: true },
        date: { type: Date, default: Date.now }
    })

module.exports = mongoose.model('Abstract', Abstract)