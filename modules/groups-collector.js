const { request } = require('./utils'),
  config = require('../config')

module.exports = async () => {
  async function get(url, result = []) {
    const response = JSON.parse((await request(url)).body)

    result = response.results.reduce((acc, group) => {
      const flow = group.name.split('-')[0]
      return acc.includes(flow) ? acc : acc.concat(flow)
    }, result)
    return response.next ? get(response.next, result) : result
  }

  return await get(config.hub_groups_url + '?limit=100')
}