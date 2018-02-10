const config = require('../../config')

module.exports = ctx => {
  const links = Object.keys(config.kpi_internets_links),
    nums = ['Раз', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь', 'Девять', 'Десять']

  const answer = links.map((link, i) => `<a href="${link}">${nums[i]}</a> - ${config.kpi_internets_links[link]}\n`)
    .join('')
  return ctx.replyWithHTML(answer)
}