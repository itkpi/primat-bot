const Abstract = require('../models/abstract'),
    { bot, ph, request } = require('../modules/utils'),
    puppeteer = require('puppeteer'),
    fs = require('fs'),
    util = require('util'),

    unlink = util.promisify(fs.unlink),
    { telegram } = require('../modules/utils').bot,

    Telegraf = require('telegraf'),
    { Markup, Extra } = Telegraf

module.exports = Router => {
    const router = Router(
        'abstract',
        ctx => ctx.message.text !== config.btns.abstracts && !ctx.session.abstract,
        ctx => (ctx.session.abstract && ctx.session.abstract.nextCondition) || 'abstract'
    )

    const loadLecture = new Telegraf.Router(ctx => {
        if (!ctx.callbackQuery.data) return

        return { route: 'load', state: { id: ctx.callbackQuery.data } }
    })

    loadLecture.on('load', ctx => {
        const sendPdf = (chat_id, filePath) => {
            const method = 'POST'
            const url = `${telegram.options.apiRoot}/bot${telegram.token}/sendDocument`
            const formData = { chat_id, document: fs.createReadStream(filePath) }
            return request({ method, url, formData })
        }

        // promises instead of async/awaits for perfomance increase (parallel operations)
        Promise.all([
            Abstract.findById(ctx.state.id),
            puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
        ])
            .then(([abstract, browser]) => Promise.all([abstract, browser, browser.newPage()]))
            .then(([abstract, browser, page]) => Promise.all([
                    `${__dirname}/../public/${abstract.name.substr(0, 45).replace(/\//g, '')}.pdf`,
                    browser,
                    page,
                    page.goto(abstract.telegraph_url, { waitUntil: 'networkidle2' })
                ])
            )
            .then(([path, browser, page]) => Promise.all([path, browser, page.pdf({ path, format: 'A4' })]))
            .then(([path, browser]) => Promise.all([
                    path,
                    browser.close(),
                    sendPdf(ctx.from.id, path),
                ])
            )
            .then(([path]) => unlink(path))
            .then(() => ctx.answerCbQuery('Читай на здоровье!'))
            .catch(e => {
                console.error(e)
                ctx.answerCbQuery('Ошибочка :c', true)
            })
    })

    router.on('abstract', async ctx => {
        try {
            const subjects = await Abstract.distinct('subject', {
                course: ctx.session.course,
                flow: ctx.session.flow,
                semester: ctx.session.semester
            })

            if (subjects.length > 0) {
                ctx.session.abstract = { nextCondition: 'subject' }
                ctx.reply(
                    'Какой предмет',
                    Markup.keyboard(subjects.concat('Отмена'), {
                        columns: subjects.length / 2
                    }).resize().extra()
                )
            } else {
                ctx.session.abstract = null
                ctx.reply(
                    'По твоему году и семестру совсем нет никаких лекций :c',
                    ctx.state.homeMarkup
                )
            }
            ctx.state.saveSession()
        } catch (e) {
            return ctx.state.error(e)
        }
    })

    router.on('subject', async ctx => {
        if (ctx.state.btnVal === 'Отмена') {
            ctx.session.abstract = null
            ctx.state.saveSession()
            return ctx.reply('nu lan', ctx.state.homeMarkup)
        }

        try {
            const amount = await Abstract.count({
                subject: ctx.state.btnVal,
                course: ctx.session.course,
                flow: ctx.session.flow,
                semester: ctx.session.semester
            })

            if (amount) {
                ctx.session.abstract.nextCondition = 'num'
                ctx.session.abstract.subject = ctx.state.btnVal
                ctx.state.saveSession()

                const buttons = new Array(amount)
                for (let i = 0; i < buttons.length; i++) buttons[i] = String(i + 1)
                if (amount > 1) buttons.push('Все')

                ctx.reply(
                    `Выбирай номер`,
                    Markup.keyboard(buttons.concat('Отмена'), { columns: 4 })
                        .resize().extra()
                )
            } else {
                ctx.reply('По этому предмету ничего нет :c')
            }
        } catch (e) {
            return ctx.state.error(e)
        }
    })

    router.on('num', async ctx => {
        if (ctx.state.btnVal === 'Отмена') {
            ctx.session.abstract = null
            ctx.state.saveSession()
            return ctx.reply('nu lan', ctx.state.homeMarkup)
        }

        try {
            const abstracts = await Abstract.find({
                subject: ctx.session.abstract.subject,
                course: ctx.session.course,
                flow: ctx.session.flow,
                semester: ctx.session.semester
            })
            .sort({ date: 1 })

            const getAbstractMarkup = id =>
                Extra.markup(m => m.inlineKeyboard([m.callbackButton('Завантажити в pdf', id)]))

            if (ctx.state.btnVal === 'Все') {
                // sendMessages(ctx, abstracts.map(i => i.telegraph_url))
                //     .then(() => console.log("All messages sent, in series!"))
                // abstracts.forEach(async i => await ctx.reply(i.telegraph_url))

                // let chain = Promise.resolve()
                // for (abstract of abstracts)
                //     chain = chain.then(ctx.reply(abstract.telegraph_url))

                let timer = 100
                abstracts.forEach(abstract =>
                    setTimeout(ctx.reply, (timer += 100), abstract.telegraph_url, getAbstractMarkup(abstract._id))
                )
            } else {
                const abstract = abstracts[ctx.state.btnVal - 1]
                if (abstract)
                    ctx.reply(abstract.telegraph_url, getAbstractMarkup(abstract._id))
                else return ctx.reply('Лекции под таким номером нет')
            }

            ctx.session.abstract = null
            ctx.state.saveSession()
            ctx.reply(
                'Держи, бро. Надеюсь, это тебе поможет не вылететь',
                ctx.state.homeMarkup
            )
        } catch (e) {
            return ctx.state.error(e)
        }
    })

    bot.on('callback_query', loadLecture)

    return router.middleware()
}
