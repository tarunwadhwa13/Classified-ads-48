const assert = require('assert')
const dotenv = require('dotenv')
const {ops: bootstrap} = require('./bootstrap.js')
const { logger, mongoClient, getDB } = require('./pipes.js')
const sexpress = require('./sexpress.js')

bootstrap.checkEnvironmentVariables()

dotenv.config()

const url = process.env.NODE_ENV === 'local'
  ? 'mongodb://localhost:27017'
  : process.env.MONGODB_URI

bootstrap.checkEnvironmentData(url)
  .then(reply => prepareData())
  .catch((err) => {
    logger.log({ level: 'error', message: 'Refusing to start because of ' + err })
    process.exit()
  })

// Use connect method to connect to the Server
const prepareData = () => {
  // TODO: maybe it's possible to use await mongoClient.connect()
  mongoClient.connect(async err => {
    assert.equal(null, err)
    const db = await getDB()
    const collection = db.collection('listing')
    // Create indexes
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
      await collection.deleteMany({})
      bootstrap.seedDevelopmenetData(db).then(async (reply) => {
        await bootstrap.createIndexes(db)
        bootstrap.wordsMapReduce(db)
      }).catch((err) => {
        logger.log({ level: 'error', message: 'Refusing to start because of ' + err })
        process.exit()
      })
    } else {
      // TODO: deal with production indexes and map reduce functions
    }
    db.on('error', function (error) {
      logger.log({ level: 'error', message: error })
      // global.mongodb.disconnect();
    })
  })
}

/**
 * NodeJS go and attach the Express app if you want;
 * let the user try a fine or a scrambled UI depending on how CPU speed goes
 * and how safe is the environment I may refuse to start anyway */
module.exports = sexpress
