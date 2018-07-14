const { infoLinks } = require('config')

module.exports = (btn, ops = {}) => {
  const defaultLinks = ops.hideDefault ? {} : infoLinks.default
  const links = Object.assign({}, infoLinks[btn], defaultLinks)
  const values = Object.keys(links)
  const info = values.map(value => `<a href="${value}">Здесь</a> ${links[value]}`).join('\n')
  return info
}
