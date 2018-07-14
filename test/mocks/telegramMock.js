const config = require('config')
const nock = require('nock')

module.exports = {
  sendMessage() {
    return nock(config.telegramApiHost)
      .persist()
      .post(`/bot${config.botToken}/sendMessage`)
      .reply(200, { ok: true })
  },
}
