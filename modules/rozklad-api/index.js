const { request } = require('../utils'),
      config = require('../../config')

class Rozklad {
  constructor() {
    this.apiRoot = config.rozklad_api_root

    this.r = (path, params = {}) => {
      const names = Object.keys(params)

      if (names.length > 1)
        throw new Error(`Too much params: [${names.join(', ')}]`)

      if (names.find(name => !['filter', 'search'].includes(name)))
        throw new Error(`Wrong parameter`)

      params = names.map(name => `${name}=${JSON.stringify(params[name])}`)
                    .join('&')

      const url = encodeURI(`${this.apiRoot}${path}/?${params}`)
      console.log(`${this.apiRoot}${path}/?${params}`)
      return request(url)
    }
  }

  async group(arg) {
    if (!arg)
      throw new Error("Argument doesn't specified")

    const { body } = typeof arg === 'object'
      ? await this.r('groups', arg)
      : await this.r(`groups/${arg}`)

    return JSON.parse(body)
  }

  async lessons(id, params = {}) {
    if (!id)
      throw new Error("Id doens't specified")

    const { body } = await this.r(`groups/${id}/lessons`, { filter: params })
    return JSON.parse(body).data
  }

  async currWeek() {
    const { body } = await this.r('weeks')
    return JSON.parse(body).data
  }
}

module.exports = Rozklad