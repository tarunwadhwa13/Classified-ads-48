// A file, A database, A mail transport ... all are pipes

const winston = require('winston')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json()
  ),
  // defaultMeta: {service: 'user-service'},
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' })
  ]
})
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    )
  }))
}

dotenv.config()
// TODO: UnhandledPromiseRejectionWarning
let mailHogTransporter

try {
  mailHogTransporter = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 1025
  })
  mailHogTransporter.verify(function (error, success) {
    if (error) {
      logger.log({ level: 'error', message: 'Refusing to start because of ' + error.message })
      process.exit()
    } else {
      logger.log({ level: 'info', message: 'MailHog server ready' })
    }
  })
} catch (error) {
  logger.log({ level: 'error', message: 'Refusing to start because of ' + error.message })
  process.exit()
}

MongoClient.prototype.isConnected = function (options) {
  options = options || {}
  if (!this.topology) return false
  return this.topology.isConnected(options)
}

const url = process.env.NODE_ENV === 'local'
  ? 'mongodb://localhost:27017'
  : process.env.MONGODB_URI

const mongoClient = new MongoClient(url, {
  useNewUrlParser: true, useUnifiedTopology: true
})

// Globale reference to avoid multiple calls.
let db
// Singleton instance promise of our database
const getDB = async () => {
  const dbName = process.env.NODE_ENV === 'development'
    ? 'listings_db_dev'
    : 'listings_db'

  return new Promise(async function (resolve, reject) {
    if (mongoClient.isConnected()) {
      db = db || await mongoClient.db(dbName)
      resolve(db)
    } else {
      MongoClient.connect(url, async function (err, client) {
        if(!client) reject(new Error(`Check if MongoDB server is up`))
        logger.log({
          level: 'info',
          message: `Connected successfully to server url: ${url.split('@')[0]},
            dbName: ${dbName}`
        })
        db = db || await client.db(dbName)
        resolve(db)
      })
    }
  })
}

// Go get mongoClient connection, to do some admin tasks
// Further go get the db
module.exports = {
  logger,
  mailHogTransporter,
  mongoClient,
  getDB
}
