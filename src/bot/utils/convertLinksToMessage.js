const { infoLinks } = require('config')

module.exports = role => {
  const links = Object.assign({}, infoLinks[role], infoLinks.default)
  const values = Object.keys(links)
  const info = values.map(value => `<a href="${value}">Здесь</a> ${links[value]}`).join('\n')
  return info
}
