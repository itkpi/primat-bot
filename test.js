const request = require('request')

const token = 'a3da7e6f97af9200ce3750a734315c0a70ce0103f9a47e0ef441c21a0ac9'

        const url = `https://api.telegra.ph/getAccountInfo?access_token=${token}&fields=["short_name","page_count", "auth_url"]`
        request(url, (err, data) => {
          if (err) throw new Error(err)
          const { auth_url } = JSON.parse(data.body).result
          console.log(auth_url)
          // user.telegraph_authurl = auth_url
          // user.save()
          // ctx.reply(`Отлично. Вот новая ссылка: ${user.telegraph_authurl}`)
        })