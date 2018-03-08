const { Router } = require('../../modules/utils'),
      { abitura_home_btns: btns } = require('../../config'),

      setGroup = require('./set-group'),
      changeGroup = require('../cabinet/change-group')('abitura'),
      course = require('../cabinet/course'),
      kpiInternets = require('./kpi-internets'),
      location = require('./location'),
      building = require('./building'),

      router = Router(
        'abitura',
        ctx => !ctx.session.abitura,
        ctx => ctx.session.abitura.nextCondition || ctx.message.text
      )


router.on(btns.location, location)
router.on(btns.set_group, setGroup)
router.on(btns.kpi_internets, kpiInternets)

router.on('changeGroup', changeGroup)
router.on('course', course)
router.on('building', building)


module.exports = router.middleware()
