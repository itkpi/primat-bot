const config = require('config')
const { assert } = require('chai')
const User = require('../src/db/models/user')
const service = require('../src/bot/service/greeter')
const Univer = require('../src/db/models/univer')
const getUserData = require('./mocks/getUserData')
const rozkladApiMock = require('./mocks/rozkladApiMock')
const telegramMock = require('./mocks/telegramMock')

describe('greeter service', () => {
  describe('registerByGroup', () => {
    before(async () => {
      telegramMock.sendMessage()
      this.univerInfo = await Univer.create({ name: config.universityName, currentSemester: 2 })
    })
    after(async () => {
      await User.collection.drop()
      await this.univerInfo.remove()
    })
    describe('when register valid single group', () => {
      before(() => {
        rozkladApiMock.getGroup()
        rozkladApiMock.searchOneGroup()
      })
      it('should register immediately', async () => {
        const result = await service.registerByGroup('кв-51', getUserData())
        assert.hasAllKeys(result, ['user'])
        assert.isObject(result.user)
      })
    })
    describe('when register invalid group', () => {
      before(() => {
        rozkladApiMock.failGetGroup()
        rozkladApiMock.failSearchGroup()
      })
      it('should return fail message', async () => {
        const result = await service.registerByGroup('neponyatnaya gruppa', getUserData())
        assert.hasAllKeys(result, ['fail'])
        assert.isString(result.fail)
      })
    })
    describe('when register group that doesn\'t exists but has variants', () => {
      before(() => {
        rozkladApiMock.failGetGroup()
        rozkladApiMock.searchGroup()
      })
      it('should return scene with group choosing', async () => {
        const result = await service.registerByGroup('кв-5', getUserData())
        const { nextScene } = result
        assert.hasAllKeys(result, ['nextScene', 'currState'])
        assert.equal(nextScene.name, config.scenes.greeter.chooseGroup)
      })
    })
    describe('when register group that exist but course wasn\'t calculated', () => {
      before(() => {
        rozkladApiMock.getGroup()
        rozkladApiMock.searchOneGroup()
      })
      it('should return scene with course setting', async () => {
        const result = await service.registerByGroup('кв-61с', getUserData())
        assert.hasAllKeys(result, ['nextScene', 'currState'])
        assert.equal(result.nextScene.name, config.scenes.greeter.setCourse)
      })
    })
  })
})
