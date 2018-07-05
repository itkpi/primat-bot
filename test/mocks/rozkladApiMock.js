const config = require('config')
const nock = require('nock')

const groupMock = {
  group_id: 802,
  group_full_name: 'кв-51',
  group_prefix: 'кв',
  group_okr: 'bachelor',
  group_type: 'daily',
  group_url: 'http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=09e21c1a-eabc-4879-8b11-65ab80e56003',
}
const getGroup = group => Object.assign({}, groupMock, { group_full_name: group })
const getGroupNameFromUri = uri => uri.split('/')[3].slice(0, -1)

module.exports = {
  getGroup() {
    return nock(config.rozkladApiHost)
      .get(/\/v2\/groups\/.*/)
      .reply(200, uri => ({ data: getGroup(getGroupNameFromUri(decodeURI(uri))) }))
  },
  failGetGroup() {
    return nock(config.rozkladApiHost)
      .get(/\/v2\/groups\/.*/)
      .reply(404)
  },
  searchGroup() {
    return nock(config.rozkladApiHost)
      .get('/v2/groups')
      .query(obj => obj.search)
      .reply(200, { data: [groupMock, groupMock, groupMock] })
  },
  searchOneGroup() {
    return nock(config.rozkladApiHost)
      .get('/v2/groups')
      .query(obj => obj.search)
      .reply(200, { data: [groupMock] })
  },
  failSearchGroup() {
    return nock(config.rozkladApiHost)
      .get('/v2/groups')
      .query(obj => obj.search)
      .reply(404)
  },
}
