const Abstract = require('../../models/abstract'),
      { bot, request } = require('../../modules/utils'),
      sendDocument = require('../../modules/send-document'),
      { telegram } = bot,
      puppeteer = require('puppeteer'),
      fs = require('fs'),
      util = require('util'),
      unlink = util.promisify(fs.unlink)

module.exports = async ctx => {
  const { username, id } = ctx.from
  console.log(`${username || id} is loading pdf. id: ${ctx.state.value}`)

  try {
    const [abstract, browser, msg] = await Promise.all([
      Abstract.findById(ctx.state.value, { telegraph_url: 1, name: 1 }),
      puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }),
      ctx.reply('Собираю лекцию...')
    ])
    const page = await browser.newPage()
    const path = `${process.cwd()}/public/${abstract.name.substr(0, 40).replace(/\//g, '')}.pdf`
    await page.goto(abstract.telegraph_url, { waitUntil: 'networkidle2' })
    await page.pdf({ path, format: 'A4' })
    await Promise.all([
      browser.close(),
      sendDocument(ctx.from.id, path),
      ctx.telegram.deleteMessage(msg.chat.id, msg.message_id)
    ])
    await Promise.all([
      unlink(path),
      ctx.answerCbQuery('Читай на здоровье!')
    ])
  } catch (e) {
    console.error(e)
    ctx.answerCbQuery('Ошибочка :c', true)
  }
}
