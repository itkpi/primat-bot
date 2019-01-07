const config = require('config')
const { assert } = require('chai')
const service = require('../src/bot/service/group')
const Univer = require('../src/db/models/univer')
const User = require('../src/db/models/user')

describe('group service', () => {
  describe('getCourse', () => {
    describe('current semester = 1', () => {
      before(async () => {
        this.univerInfo = await Univer.create({ name: config.universityName, currentSemester: 1 })
      })
      after(async () => {
        await this.univerInfo.remove()
      })
      describe('workable group', () => {
        it('should return valid course', async () => {
          const groupName = 'kv-51'
          const expectedCourse = 4
          const course = await service.getCourse(groupName)
          assert.equal(course, expectedCourse)
        })
      })
    })
    describe('current semester = 2', () => {
      before(async () => {
        this.univerInfo = await Univer.create({ name: config.universityName, currentSemester: 2 })
      })
      after(async () => {
        await this.univerInfo.remove()
      })
      describe('workable group', () => {
        it('should return valid course', async () => {
          const groupName = 'kv-51'
          const expectedCourse = 4
          const course = await service.getCourse(groupName)
          assert.equal(course, expectedCourse)
        })
      })
    })
    describe('unworkable group without accorded in db', () => {
      it('should return null', async () => {
        const groupName = 'кв-51м'
        const result = await service.getCourse(groupName)
        assert.isNull(result)
      })
    })
    describe('unworkable group with accorded in db', () => {
      before(async () => {
        this.course = 4
        this.groupName = 'кв-51м'
        this.user = await User.create({
          tgId: '1',
          firstName: 'a',
          role: 'student',
          group: this.groupName,
          course: this.course,
        })
      })
      after(async () => {
        await this.user.remove()
      })
      it('should take course from another user', async () => {
        const course = await service.getCourse(this.groupName)
        assert.equal(course, this.course)
      })
    })
  })
})
