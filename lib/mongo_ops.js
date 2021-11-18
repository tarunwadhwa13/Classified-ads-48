// TODO: LOG inserts and updates
// TODO: get rid of promise when using await in most cases, 
// if not, specify jsdoc like 
// /**
// * @return {Promise<string>}
// */
const mongodb = require('mongodb')
const { logger, getDB } = require('../pipes.js')

const { ObjectID } = mongodb

const queries = {}
const ops = {}


/**
 * Insert a document into DB
 * @param {*} elem a JSON representation of a Listing
 * @return {Promise}
 */
queries.insertDocument = async function (elem) {
  logger.log({ level: 'info', message: 'MONGO insertDocument' })
  db = await getDB()
  // https://stackoverflow.com/a/59841285/1951298
  elem.geolocation = {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [elem.lng, elem.lat]
  }
  // TODO: isArabic?
  const collection = db.collection('listing')
  return new Promise(function (resolve, reject) {
    collection.insertOne(elem, function (err, result) {
      logger.log({ level: 'info', message: 'MONGO Inserted 1 listing' })
      if (err) {
        return reject(err)
      }
      return resolve(result.ops[0])
    })
  })
}

/**
 * Insert a document -message into DB
 * @param {*} elem a JSON representation of a Listing
 * @return {Promise}
 */
queries.insertMessage = async function (elem) {
  logger.log({ level: 'info', message: 'MONGO insertMessage' })
  db = await getDB()
  const result = await db.collection('user').insertOne(elem)
  logger.log({ level: 'info', message: 'MONGO Inserted 1 message' })
  return result.ops[0]
}

/**
 * Get documents -messages from DB
 * @param {string} peer1 email of sender or reciever
 * @param {string} peer2 email of sender or reciever
 * @param {string} thread id of the thread where a message was sent/recieved
 * @return {Promise}
 */
 queries.getMessages = async function (peer1, peer2, thread) {
  logger.log({ level: 'info', message: 'MONGO getMessage' })
  db = await getDB()
  const forward = {$and: [{from: peer1}, {to: peer2}]}
  const backward = {$and: [{from: peer2}, {to: peer1}]}
  const bidirection = {$or: [forward, backward]}
  const query = {$and: [bidirection, {thread: thread}]}
  const result = await db.collection('user').find(query).sort({sent:-1}).toArray()
  return result
}


const baseQuery = { d: false, a: true }
const baseProjection = { pass: 0.0, geolocation: 0.0, d: 0.0, a: 0.0 }
const baseSort = [['_id', 'desc']]
/**
 * Get a document from DB
 * If Admin then get unnaproved document
 * @param {String} id Id of a Listing
 * @param {Boolean} isAdmin if the caller is admin
 * @return {Promise}
 */
queries.getDocumentById = async function (id, isAdmin) {
  db = await getDB()
  const collection = db.collection('listing')
  const query = isAdmin ? { a: false } : JSON.parse(JSON.stringify(baseQuery))
  return new Promise(function (resolve, reject) {
    try {
      new ObjectID(id)
    } catch (err) {
      return reject(err)
    }
    query._id = new ObjectID(id)
    collection.findOne(query, { projection: baseProjection })
      .then((doc) => {
        resolve(doc)
      })
  })
}

/**
 * This function returns an ObjectId embedded with a given datetime
 * Accepts number of days since document was created
 * Author: https://stackoverflow.com/a/8753670/1951298
 * @param {Number} days
 * @return {object}
 */
function getObjectId (days) {
  const yesterday = new Date()
  days = days || (process.env.NODE_ENV === 'local' ? 1000 : 14)
  yesterday.setDate(yesterday.getDate() - days)
  const hexSeconds = Math.floor(yesterday / 1000).toString(16)
  const constructedObjectId = new ObjectID(hexSeconds + '0000000000000000')
  return constructedObjectId
};

/**
 * Get documents created since number of days
 * @param {*} days number of days since document was created
 * @param {*} section which section
 * @param {*} pagination number of pages and listings in each page
 * @return {Promise}
 */
queries.getDocumentsSince = async function (days, section, pagination) {
  db = await getDB()
  const collection = db.collection('listing')
  const objectId = getObjectId(days)
  const query = JSON.parse(JSON.stringify(baseQuery))
  query._id = { $gt: objectId }
  if (section) query.section = section
  return new Promise(function (resolve, reject) {
    collection.find(query)
      .project(baseProjection)
      .sort(baseSort)
      .skip((pagination.perPage * pagination.page) - pagination.perPage)
      .limit(pagination.perPage)
      .toArray(async function (err, docs) {
        if (err) {
          return reject(err)
        }
        const count = await collection.countDocuments(query)
        return resolve({ documents: docs, count: count })
      })
  })
}

/**
 * Get documents created by a specific user
 * @param {*} user user email
 * @return {Promise}
 */
queries.getDocumentsByUser = async function (user) {
  db = await getDB()
  const collection = db.collection('listing')
  const query = {}
  query.usr = user
  return new Promise(function (resolve, reject) {
    collection.find(query)
      .project(baseProjection)
      .sort(baseSort)
      .toArray(function (err, docs) {
        if (err) {
          return reject(err)
        }
        return resolve(docs)
      })
  })
}

/**
 * Approximate search based on indexed text fields: title, desc, tags
 * @param {*} phrase sentense to search
 * @param {*} exact whether search the exact sentense or separate terms
 * @param {*} division which division
 * @param {*} section which section
 * @return {Promise}
 */
queries.gwoogl = async function (phrase, exact, division, section) {
  db = await getDB()
  const collection = db.collection('listing')
  const objectId = getObjectId(100)
  phrase = exact ? `\"${phrase}\"` : phrase
  const query = JSON.parse(JSON.stringify(baseQuery))
  query.$text = { $search: phrase }
  query._id = { $gt: objectId }
  if (section) query.section = section
  if (division) query.div = division
  return new Promise(function (resolve, reject) {
    collection.find(query, { score: { $meta: 'textScore' } })
      .project(baseProjection)
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .toArray(function (err, docs) {
        if (err) {
          return reject(err)
        }
        return resolve(docs)
      })
  })
}

/**
 * Search tag based on indexed tags field
 * @param {*} tag which tag
 * @param {*} pagination number of pages and listings in each page
 * @return {Promise}
 */
queries.getDocumentsByTag = async function (tag, pagination) {
  db = await getDB()
  const collection = db.collection('listing')
  const objectId = getObjectId(100)
  const query = JSON.parse(JSON.stringify(baseQuery))
  query._id = { $gt: objectId }
  query.tags = tag
  return new Promise(function (resolve, reject) {
    collection.find(query)
      .project(baseProjection)
      .sort(baseSort)
      .skip((pagination.perPage * pagination.page) - pagination.perPage)
      .limit(pagination.perPage)
      .toArray(async function (err, docs) {
        if (err) {
          return reject(err)
        }
        const count = await collection.countDocuments(query)
        return resolve({ documents: docs, count: count })
      })
  })
}

/**
 * Search tag based on division field
 * @param {*} division which division
 * @param {*} pagination number of pages and listings in each page
 * @return {Promise}
 */
queries.getDocumentsByDivision = async function (division, pagination) {
  db = await getDB()
  const collection = db.collection('listing')
  const objectId = getObjectId(100)
  const query = JSON.parse(JSON.stringify(baseQuery))
  query._id = { $gt: objectId }
  query.div = division
  return new Promise(function (resolve, reject) {
    collection.find(query)
      .project(baseProjection)
      .sort(baseSort)
      .skip((pagination.perPage * pagination.page) - pagination.perPage)
      .limit(pagination.perPage)
      .toArray(async function (err, docs) {
        if (err) {
          return reject(err)
        }
        const count = await collection.countDocuments(query)
        return resolve({ documents: docs, count: count })
      })
  })
}

/**
 * Search based on indexed Geospatial field: lat, lng
 * @param {*} latitude
 * @param {*} longitude
 * @param {*} section
 * @return {Promise}
 */
queries.getDocumentsByGeolocation = async function (latitude, longitude, section) {
  db = await getDB()
  const collection = db.collection('listing')
  const objectId = getObjectId(100)
  const query = JSON.parse(JSON.stringify(baseQuery))
  query._id = { $gt: objectId }
  if (section) query.section = section
  query.geolocation = {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      $maxDistance: 6 * 4 * 1000, // 24 KM
      $minDistance: 0
    }
  }
  return new Promise(function (resolve, reject) {
    collection.find(query)
      .project(baseProjection)
      .sort(baseSort)
      .limit(20)
      .toArray(function (err, docs) {
        if (err) {
          return reject(err)
        }
        return resolve(docs)
      })
  })
}

queries.deactivateDocument = async function (password) {
  db = await getDB()
  const collection = db.collection('listing')
  const query = JSON.parse(JSON.stringify(baseQuery))
  query.pass = password
  const newValues = { $set: { d: true } }
  const options = { upsert: false }
  return new Promise(function (resolve, reject) {
    collection.findOneAndUpdate(query, newValues, options, function (err, res) {
      if (err) reject(err)
      if (res.lastErrorObject.n === 0) {
        reject(new Error('document to be deactivated not found'))
      }
      resolve(res._id)
    })
  })
}

queries.approveDocument = async function (id) {
  db = await getDB()
  const collection = db.collection('listing')
  const query = JSON.parse(JSON.stringify(baseQuery))
  query._id = new ObjectID(id)
  query.a = false
  const newValues = { $set: { a: true } }
  const options = { upsert: false }
  return new Promise(function (resolve, reject) {
    collection.findOneAndUpdate(query, newValues, options, function (err, res) {
      if (err) reject(err)
      if (res.lastErrorObject.n === 0) {
        reject(new Error('document to be approved not found'))
      }
      resolve(res._id)
    })
  })
}

queries.reactivateDocument = async function (password) {
  db = await getDB()
  const collection = db.collection('listing')
  const query = JSON.parse(JSON.stringify(baseQuery))
  query.pass = password
  query.d = true
  const newValues = { $set: { d: false } }
  const options = { upsert: false }
  return new Promise(function (resolve, reject) {
    collection.findOneAndUpdate(query, newValues, options, function (err, res) {
      if (err) reject(err)
      if (res.lastErrorObject.n === 0) {
        reject(new Error('document to be reactivated not found'))
      }
      resolve(res._id)
    })
  })
}

queries.autocomplete = async function (keyword) {
  db = await getDB()
  const collection = db.collection('words')
  const keywRgx = new RegExp('^' + keyword, 'i')
  return new Promise(function (resolve, reject) {
    collection.find({ _id: keywRgx }).project({ _id: 1 }).toArray(function (err, docs) {
      if (err) {
        return reject(err)
      }
      return resolve(docs)
    })
  })
}

queries.getDocumentsByKeyword = async function (keyword, pagination) {
  db = await getDB()
  const collection = db.collection('words')
  return new Promise(function (resolve, reject) {
    collection.findOne({ _id: keyword }, function (err, result) {
      if (err) {
        reject(err)
      }
      if (result) {
        const objIds = result.value.documents
        db.collection('listing').find({ _id: { $in: objIds } })
          .project(baseProjection)
          .sort(baseSort)
          .skip((pagination.perPage * pagination.page) - pagination.perPage)
          .limit(pagination.perPage)
          .toArray(
            async function (err, docs) {
              if (err) {
                reject(err)
              }
              const count = await collection.countDocuments({ _id: { $in: objIds } })
              return resolve({ documents: docs, count: count })
            })
      } else {
        resolve([])
      }
    })
  })
}

module.exports.mongoQueries = queries
module.exports.mongoOps = ops
