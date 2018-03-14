const fs = require('fs')
const { request, bot } = require('./utils')

module.exports = (chat_id, filePath) => {
  const method = 'POST'
  const url = `${bot.telegram.options.apiRoot}/bot${bot.telegram.token}/sendDocument`
  const formData = { chat_id, document: fs.createReadStream(filePath) }
  return request({ method, url, formData })
}