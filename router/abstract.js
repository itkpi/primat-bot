const Abstract = require('../models/abstract'),
    { bot, ph } = require('../modules/utils'),
    { serialize } = require('parse5'),

    { JSDOM } = require('jsdom'),
    { window } = new JSDOM(`<!DOCTYPE html><html></html>`),

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

        return { route: 'load', state: { path: ctx.callbackQuery.data } }
    })

    loadLecture.on('load', async ctx => {
        try {
            const page = await ph.getPage(ctx.state.path, { return_content: true })
            // console.log(page.content)
            // console.log(nodeToDom(page.content[0]))
            // console.log(page)
            console.log(serialize(page.content[0]))
            return ctx.answerCbQuery('Читай на здоровье!', true)
        } catch(e) {
            console.error(e)
            return ctx.answerCbQuery('Ошибочка :c', true)
        }
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
            const getAbstractMarkup = id => Extra.markup(m => m.inlineKeyboard([m.callbackButton('Завантажити в pdf', id)]))

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
                abstracts.forEach(abstract =>
                    setTimeout(ctx.reply, (timer += 100), abstract.telegraph_url, getAbstractMarkup(abstract.telegraph_path))
                )
            } else {
                const abstract = abstracts[ctx.state.btnVal - 1]
                if (abstract)
                    ctx.reply(abstract.telegraph_url, getAbstractMarkup(abstract.telegraph_path))
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

function nodeToDom(node) {
  if (typeof node === 'string' || node instanceof String) {
    return window.document.createTextNode(node);
  }
  if (node.tag) {
    var domNode = window.document.createElement(node.tag);
    if (node.attrs) {
      for (var name in node.attrs) {
        var value = node.attrs[name];
        domNode.setAttribute(name, value);
      }
    }
  } else {
    var domNode = window.document.createDocumentFragment();
  }
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      domNode.appendChild(nodeToDom(child));
    }
  }
  return domNode;
}

// var article = document.getElementById('article');
// var content = domToNode(article).children;
// $.ajax('https://api.telegra.ph/createPage', {
//   data: {
//     access_token:   '%access_token%',
//     title:          'Title of page',
//     content:        JSON.stringify(content),
//     return_content: true
//   },
//   type: 'POST',
//   dataType: 'json',
//   success: function(data) {
//     if (data.content) {
//       while (article.firstChild) {
//         article.removeChild(article.firstChild);
//       }
//       article.appendChild(nodeToDom({children: data.content}));
//     }
//   }
// });