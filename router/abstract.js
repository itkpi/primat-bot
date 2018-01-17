const { Markup } = require('telegraf'),
    Abstract = require('../models/abstract')

module.exports = Router => {
    const router = Router(
        'abstract',
        ctx => ctx.message.text !== config.btns.abstracts && !ctx.session.abstract,
        ctx => (ctx.session.abstract && ctx.session.abstract.nextCondition) || 'abstract'
    )

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

            if (ctx.state.btnVal === 'Все') {
                // sendMessages(ctx, abstracts.map(i => i.telegraph_url))
                //     .then(() => console.log("All messages sent, in series!"))
                // abstracts.forEach(async i => await ctx.reply(i.telegraph_url))

                // let chain = Promise.resolve()
                // for (abstract of abstracts)
                //     chain = chain.then(ctx.reply(abstract.telegraph_url))

                let timer = 100
                abstracts.forEach(i =>
                    setTimeout(ctx.reply, (timer += 100), i.telegraph_url)
                )
            } else {
                if (abstracts[ctx.state.btnVal - 1])
                    ctx.reply(abstracts[ctx.state.btnVal - 1].telegraph_url)
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

    return router.middleware()
}
