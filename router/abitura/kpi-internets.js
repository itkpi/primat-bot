module.exports = ctx => {
  const links = Object.keys(config.kpi_internets_links)

  const answer = links.map(link => `${link} - ${config.kpi_internets_links[link]}\n\n`)
                      .join('')
  return ctx.reply(answer)
}