const { MongoClient } = require('mongodb')
const miss = require('mississippi')
const fs = require('fs')
const strs = require('stringstream')
const zlib = require('zlib')
const JSONStream = require('JSONStream')
const Promise = require('bluebird')
const debug = require('debug')('hackurba:import')

const sources = {
  info_surf: 'info',
  info_lin: 'info',
  prescription_lin: 'prescriptions',
  prescription_pct: 'prescriptions',
  prescription_surf: 'prescriptions',
  secteur_cc: 'secteurs_cc',
  zone_urba: 'zone_urba'
}

const connectionString = process.env.MONGODB_URL || 'mongodb://localhost/gpu'

let _mongoConnectionPromise

function getConnection() {
  if (!_mongoConnectionPromise) _mongoConnectionPromise = MongoClient.connect(connectionString)
  return _mongoConnectionPromise
}

function importSource(source) {
  const destCollection = sources[source]
  console.log('Importing %s into %s', source, destCollection)
  return getConnection().then(db => {
    const collection = db.collection(destCollection)
    let progress = 0
    let pressure = 0
    let ended = false
    return new Promise((resolve, reject) => {
      const featuresPipeline = miss.pipeline.obj(
        fs.createReadStream(__dirname + '/data/' + source + '.geojson.gz'),
        zlib.createGunzip(),
        strs('utf8'),
        JSONStream.parse('features.*')
      ).on('data', eachFeature).on('error', reject).on('finish', () => ended = true)

      function eachFeature(feature) {
        pressure++
        progress++
        if (progress % 100 === 0) console.log('progress: %d', progress)
        debug('pressure: %d', pressure)
        const obj = Object.assign({}, feature.properties, { geometry: feature.geometry })
        collection.insertOne(obj, (err, res) => {
          pressure--
          debug('pressure: %d', pressure)
          if (err) console.error(err)
          if (pressure === 0 && ended) {
            console.log('finished: %d', progress)
            resolve()
          }
        })
      }
    })
  })
}

Promise.mapSeries(Object.keys(sources), importSource).then(() => console.log('finished')).catch(console.error)
