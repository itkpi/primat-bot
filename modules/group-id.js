const util = require('util'),
      request = util.promisify(require('request')),
      searchUrl = 'https://api.rozklad.hub.kpi.ua/groups/?search='

module.exports = async (group, ctx) => {
  let response
  try {
    response = await request(encodeURI(searchUrl + group))
  } catch(e) {
    return ctx.state.error(e)
  }
  const groupHub = JSON.parse(response.body).results.find(i => i.name === group)
  return groupHub ? groupHub.id : undefined
}