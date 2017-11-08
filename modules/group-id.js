const util = require('util'),
      { request } = require('./utils')

module.exports = async (group, ctx) => {
  let response
  try {
    response = await request(encodeURI(`${config.hub_groups_url}?search=${group}`))
  } catch(e) {
    return ctx.state.error(e)
  }
  const groupHub = JSON.parse(response.body).results.find(i => i.name === group)
  return groupHub ? groupHub.id : undefined
}