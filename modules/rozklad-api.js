const { request } = require('./utils'),
      config = require('../config')

class Rozklad {
  constructor() {
    this.apiRoot = config.rozklad_api_root

    this.r = async (path, params = {}) => {
      const names = Object.keys(params)

      if (names.length > 1)
        throw new Error(`Too much params: [${names.join(', ')}]`)

      if (names.find(name => !['filter', 'search'].includes(name)))
        throw new Error(`Wrong parameter`)

      params = names.map(name => `${name}=${JSON.stringify(params[name])}`)
                    .join('&')

      const url = encodeURI(`${this.apiRoot}${path}/?${params}`),
            { body } = await request(url)
      return JSON.parse(body).data
    }
  }

  async group(arg) {
    if (!arg)
      throw new Error("Argument doesn't specified")

    return typeof arg === 'object'
      ? await this.r('groups', arg)
      : await this.r(`groups/${arg}`)
  }

  async lessons(id, params) {
    if (!id)
      throw new Error("Id doens't specified")

    return params
      ? await this.r(`groups/${id}/lessons`, { filter: params })
      : await this.r(`groups/${id}/timetable`)
  }

  async currWeek() {
    // wrong response
    const week = await this.r('weeks'),
          currWeek = week === 1 ? 2 : 1
    return currWeek
  }
}

module.exports = Rozklad