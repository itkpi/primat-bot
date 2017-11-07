const { request } = require('./modules/utils')

const mongoose = require('./modules/mongoose')

const Schema = mongoose.Schema,

    kpiInfo = new Schema({
      name: { type: String, unique: true },
      flows: [{ type: String }]
    }),
    Model = mongoose.model('kpiInfo', kpiInfo);

async function eee() {
  async function get(url, result = []) {
    const response = JSON.parse((await request(url)).body)

    result = response.results.reduce((acc, group) => {
      const flow = group.name.split('-')[0]
      return acc.includes(flow) ? acc : acc.concat(flow)
    }, result)
    return response.next ? get(response.next, result) : result
  }

  const res = await get('http://api.rozklad.hub.kpi.ua/groups?limit=100')
  console.log(res)

  const model = new Model({ flows: res, name: 'flows' })
  model.save()

  return res
}

eee()