const config = require('config')
const got = require('got')
// const mathmode = require('mathmode')
const { parseFragment } = require('parse5')
const picasa = require('../../modules/picasa')
const telegraph = require('../../modules/telegraph')
const Abstract = require('../../db/models/abstract')
const univerService = require('./univer')

const convert = info => nodes => nodes.map(node => {
  if (node.value && node.value.trim() === '') return false
  if (node.childNodes) {
    node.children = convert(info)(node.childNodes)
  }
  let src
  if (node.tagName === 'img') {
    src = node.attrs.find(i => i.name === 'src')
    if (src && parseInt(src.value, 10) === info.photosAmount + 1) {
      src.value = `${info.photosAmount}${config.textPhotosNumPostfix}`
      info.photosAmount += 1
    }
  }
  if (node.tagName === 'l') {
    const [target] = node.childNodes
    const value = target.value.trim()
    if (value) {
      node.tagName = 'img'
      const attr = {
        name: 'src',
        value: `${info.latexExpressions.length}latex${config.textPhotosNumPostfix}`,
      }
      node.attrs.push(attr)
      src = attr
      info.latexExpressions.push(value)
    }
  }
  node.tag = node.tagName || node.parentNode.tagName || 'p'
  if (!node.children) {
    node.children = [node.value]
  }
  return {
    tag: node.tag,
    children: node.children,
    attrs: src ? { src: src.value } : null,
  }
})

function insertPhotoLinks(page, photos, latexPhotoLinks) {
  if (photos.length > 0 || latexPhotoLinks.length > 0) {
    let src = JSON.stringify(page)
    photos.forEach(({ content: { src: link } }, indx) => {
      src = src.replace(`${indx}${config.textPhotosNumPostfix}`, link)
    })
    latexPhotoLinks.forEach(({ content: { src: link } }, indx) => {
      src = src.replace(`${indx}latex${config.textPhotosNumPostfix}`, link)
    })
    return JSON.parse(src)
  }
  return page
}

function getPicasaAccessToken() {
  return new Promise((resolve, reject) => {
    const params = {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
    }
    picasa.renewAccessToken(params, config.picasaRefreshToken,
      (err, token) => err ? reject(err) : resolve(token))
  })
}

module.exports = {
  parse(text) {
    const title = text.slice(0, text.indexOf('\n'))
    text = text.substring(text.indexOf('\n') + 1) // remove first line
    const info = { photosAmount: 0, latexExpressions: [] }
    const page = convert(info)(parseFragment(text).childNodes)
    return {
      title,
      page,
      photosAmount: info.photosAmount,
      latexExpressions: info.latexExpressions,
    }
  },
  // storeLatexExpressions(user, pageData) {
  //   const binariesGenTasks = pageData.latexExpressions.map(
  //     expression => new Promise((resolve, reject) => {
  //       const render = mathmode(expression)
  //       const bufs = []
  //       render.on('data', data => bufs.push(data))
  //       render.on('error', reject)
  //       render.on('finish', () => resolve(Buffer.concat(bufs)))
  //     }),
  //   )
  //   return uploadPhotos(binariesGenTasks, user, pageData)
  // },
  async createTelegraphPage(user, data) {
    const { photoLinks, latexExpressions, title } = data
    const tasks = [
      univerService.getCurrSemester(),
      photoLinks && this.storePhotos(data, user),
      latexExpressions && this.storeLatexExpressions(latexExpressions, user),
    ]
    const [semester, storedPhotos = [], storedLatexPhotos = []] = await Promise.all(tasks)
    data.page = insertPhotoLinks(data.page, storedPhotos, storedLatexPhotos)
    const { telegraph: { accessToken }, flow, course } = user
    const ops = { return_content: true }
    const telegraphPage = await telegraph.createPage(accessToken, title, data.page, ops)
    const abstract = new Abstract({
      flow,
      course,
      semester,
      authorId: user.tgId,
      subject: data.subject,
      url: telegraphPage.url,
      path: telegraphPage.path,
      title: telegraphPage.title,
      photos: data.photos,
      storedPhotos: storedPhotos.concat(storedLatexPhotos),
    })
    return abstract.save()
  },
  async storePhotos(pageData, user) {
    const picasaToken = await getPicasaAccessToken()
    const { course, username, tgId } = user
    const { subject, title, photoLinks } = pageData
    const summary = `${title}. Created by ${username || tgId}.`
    const getTitle = num => `Photo #${num}. ${course} course. ${subject}`
    const photoData = {
      summary,
      contentType: 'image/jpg',
    }
    const tasks = photoLinks.map((url, num) => got(url, { encoding: null })
      .then(({ body: binary }) => picasa.postPhoto(
        picasaToken,
        config.picasaAlbumId,
        Object.assign({}, photoData, { title: getTitle(num + 1), binary }),
      )))
    return Promise.all(tasks)
  },
}
