/*global emit*/

const router = require('express').Router(),
      Abstract = require('../models/abstract'),
      mongoose = require('mongoose'),
      log = require('../modules/logger')

router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  })
  next()
})

router.use((req, res, next) => {
  log.info(req.method, req.url)
  next()
})

router.get('/abstracts-info', async (req, res) => {
  try {
    const o = {
      map: function() {
        emit(this.flow, `${this.course}_${this.semester}`)
      },
      reduce: function(k, courses) {
        return JSON.stringify(courses
          .filter((c, i, self) => self.indexOf(c) === i)
          .reduce((acc, value) => {
            const [course, semester] = value.split('_')
            if (!acc[course])
              acc[course] = { semesters: [] }
            if (!acc[course].semesters.includes(semester))
              acc[course].semesters.push(semester)
            return acc
          }, { }))
      }
    }
    const data = (await Abstract.mapReduce(o))
      .map(({ _id, value }) => ({ flow: _id, courses: JSON.parse(value) }))

    res.json({ data })
  } catch (err) {
    log.error({ err }, 'api abstracts-info route')
    res.status(500).json({ error: 'error' })
  }
})

router.get('/abstracts/:id?', async (req, res) => {
  try {
    const { id } = req.params
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ error: 'Invalid id' })

      const abstract = await Abstract.findById(id, '-__v')
      return abstract
        ? res.json({ data: abstract })
        : res.status(404).json({ data: null })
    }

    const { semester, flow, course } = req.query
    if (!(semester && flow && course))
      return res.json({ error: 'Expected id or three parameters: semester, flow, course' })

    const data = await Abstract.aggregate([
      { $match: {
        semester: { $eq: Number(semester) },
        flow: { $eq: flow },
        course: { $eq: Number(course) }
      } },
      { $group: { _id: '$subject', abstracts: { $push: {
        id: '$_id',
        flow: '$flow',
        course: '$course',
        author: '$author',
        name: '$name',
        semester: '$semester',
        authorId: '$authorId',
        date: '$date',
        telegraph_url: '$telegraph_url',
        telegraph_path: '$telegraph_path',
        telegraph_title: '$telegraph_title'
      } } } },
      { $project: {
        _id: 0,
        subject: '$_id',
        abstracts: '$abstracts'
      } }
    ])

    res.json({ data })
  } catch (err) {
    log.error({ err }, 'api abstracts route')
    res.status(500).json({ error: 'error' })
  }
})

module.exports = router
