const util = require('util'),
      { request } = require('./utils')

module.exports = async (group) => {
  const response = await request(encodeURI(`${config.hub_groups_url}?search=${group}`)),
        { results } = JSON.parse(response.body),
        groupHub = results.find(i => i.name === group)

  return groupHub ? groupHub.id
                  : results.length > 0 ? results : null
}