// A file, A database, A mail transport ... all are pipes

const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.json(),
  ),
  // defaultMeta: {service: 'user-service'},
  transports: [
    new winston.transports.File({filename: './logs/error.log', level: 'error'}),
    new winston.transports.File({filename: './logs/combined.log'}),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
// TODO: UnhandledPromiseRejectionWarning
let mailHogTransporter;

try {
  mailHogTransporter = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 1025,
  });
  mailHogTransporter.verify(function(error, success) {
    if (error) {
      logger.log({level: 'error', message: error.message});
    } else {
      logger.log({level: 'info', message: 'MailHog server ready'});
    }
  });
} catch (error) {
  logger.log({level: 'error', message: error.message});
}

const MongoClient = require('mongodb').MongoClient;
const url = process.env.NODE_ENV === 'local' ?
  'mongodb://localhost:27017' : process.env.MONGODB_URI;
const mongoClient = new MongoClient(url, {
  useNewUrlParser: true, useUnifiedTopology: true,
});
let db;
const getDB = () => {
  const dbName = process.env.NODE_ENV === 'development' ? 'listings_db_dev' : 'listings_db';
  logger.log({
    level: 'info',
    message: `Connected successfully to server url: ${url.split('@')[0]},
      dbName: ${dbName}`,
  });
  db = db ? db : mongoClient.db(dbName);
  return db;
};


module.exports = {logger, mailHogTransporter, mongoClient, getDB};
