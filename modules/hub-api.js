const { request } = require('./utils'),
      config = require('../config')

class Hub {
  constructor() {
    this.apiRoot = config.hub_api_root

    this.r = async (path) => {
      const url = encodeURI(`${this.apiRoot}${path}/?limit=100`);
      const { body } = await request(url)
      return JSON.parse(body).results
    }
  }

  async buildings() {
    return await this.r('buildings')
  }
}

module.exports = Hub