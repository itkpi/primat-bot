const os = require('os')

const [ipv4] = os.networkInterfaces().wlp2s0
console.log(ipv4.address)

module.exports = ctx => {
  console.log(ctx.inlineQuery)
  console.log(ctx.chosenInlineResult)
  ctx.answerInlineQuery([{
    // type: 'photo',
    id: 1,
    type: 'article',
    title: 'kek',
    input_message_content: { message_text: 'lol' }
  }])
}