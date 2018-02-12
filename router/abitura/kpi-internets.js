const config = require('../../config')

module.exports = ctx => {
  const links = Object.keys(config.kpi_internets_links)

  const answer = links.map(link => `<a href="${link}">${config.kpi_internets_links[link]}</a>`)
    .join('\n')
  return ctx.replyWithHTML(answer)
}