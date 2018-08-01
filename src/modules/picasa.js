const util = require('util')
const Picasa = require('picasa')

const picasa = new Picasa()

picasa.getAlbums = util.promisify(picasa.getAlbums)
picasa.postPhoto = util.promisify(picasa.postPhoto)

module.exports = picasa
