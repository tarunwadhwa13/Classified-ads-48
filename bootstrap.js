
const { logger, mailHogTransporter } = require('./pipes')
const schema = {
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'http://example.com/example.json',
  type: 'object',
  title: 'The root schema',
  description: 'The root schema comprises the entire JSON document.',
  default: {},
  examples: [
    {
      title: 'gqrgqrgergergrege',
      tags: [
        'Dog Supplies'
      ],
      desc: 'sdpogk pokgp okqgp$ kqpofgqgf',
      lat: 36.68339,
      lng: 2.89224,
      section: 'donations',
      pass: 'a7egz7vrl',
      d: false,
      a: true,
      usr: 'you@there.com',
      ara: false
    }
  ],
  required: [
    'title',
    'tags',
    'desc',
    'lat',
    'lng',
    'section',
    'pass',
    'd',
    'a',
    'usr',
    'ara'
  ],
  properties: {
    title: {
      $id: '#/properties/title',
      default: '',
      faker: 'lorem.sentence',
      description: 'Title of a listing. (required) : a small string sentence in English or Arabic. User defined.',
      examples: [
        'gqrgqrgergergrege'
      ],
      title: 'The title schema',
      maxLength: 100,
      minLength: 10,
      type: 'string'
    },
    tags: {
      $id: '#/properties/tags',
      default: [],
      description: 'An explanation about the purpose of this instance.',
      examples: [
        [
          'Dog Supplies'
        ]
      ],
      title: 'The tags schema',
      maxItems: 3,
      minItems: 1,
      type: 'array',
      additionalItems: true,
      items: {
        $id: '#/properties/tags/items',
        maxItems: 3,
        minItems: 1,
        type: [],
        anyOf: [
          {
            $id: '#/properties/tags/items/anyOf/0',
            default: '',
            description: 'An explanation about the purpose of this instance.',
            faker: 'lorem.word',
            examples: [
              'Dog Supplies'
            ],
            title: 'The first anyOf schema',
            maxLength: 20,
            minLength: 3,
            type: 'string'
          }
        ]
      }
    },
    desc: {
      $id: '#/properties/desc',
      default: '',
      description: 'An explanation about the purpose of this instance.',
      faker: 'lorem.sentence',
      examples: [
        'sdpogk pokgp okqgp$ kqpofgqgf'
      ],
      title: 'The desc schema',
      maxLength: 3000,
      minLength: 10,
      type: 'string'
    },
    lat: {
      $id: '#/properties/lat',
      type: 'string',
      title: 'The lat schema',
      description: 'An explanation about the purpose of this instance.',
      faker: 'address.latitude',
      examples: [
        '36.68339'
      ]
    },
    lng: {
      $id: '#/properties/lng',
      type: 'string',
      title: 'The lng schema',
      description: 'An explanation about the purpose of this instance.',
      faker: 'address.longitude',
      examples: [
        '2.89224'
      ]
    },
    section: {
      $id: '#/properties/section',
      type: 'string',
      title: 'The section schema',
      description: 'An explanation about the purpose of this instance.',
      default: '',
      examples: [
        'donations'
      ]
    },
    pass: {
      $id: '#/properties/pass',
      type: 'string',
      title: 'The pass schema',
      description: 'An explanation about the purpose of this instance.',
      default: '',
      faker: 'lorem.word',
      examples: [
        'a7egz7vrl'
      ]
    },
    d: {
      $id: '#/properties/d',
      type: 'boolean',
      title: 'The d schema',
      description: 'An explanation about the purpose of this instance.',
      default: false,
      examples: [
        false
      ]
    },
    a: {
      $id: '#/properties/a',
      type: 'boolean',
      title: 'The a schema',
      description: 'An explanation about the purpose of this instance.',
      default: false,
      examples: [
        true
      ]
    },
    usr: {
      $id: '#/properties/usr',
      type: 'string',
      title: 'The usr schema',
      faker: 'internet.email',
      description: 'An explanation about the purpose of this instance.',
      default: '',
      examples: [
        'you@there.com'
      ]
    },
    ara: {
      $id: '#/properties/ara',
      type: 'boolean',
      title: 'The ara schema',
      description: 'An explanation about the purpose of this instance.',
      default: false,
      examples: [
        false
      ]
    }
  },
  additionalProperties: true
}

const oAuthSampleProfile = {
  email: 'bacloud14@gmail.com',
  picture: 'https://lh3.googleusercontent.com/a/AATXAJwkHr4D-xfuPdn6osK7-k884sA8E8UxLm0p_7FO=s96-c',
  nickname: 'bacloud14',
  email_verified: true,
  sub: 'google-oauth2|######'
}

// eslint-disable-next-line max-len
const wilayas = ['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Bechar', 'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda', 'Sidi bel abbes', 'Annaba', 'Guelma', 'Constantine', 'Medea', 'Mostaghanem', 'Msila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdes', 'El Taref', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchla', 'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Timouchent', 'Ghardaïa', 'Relizane']

const langs = ['english', 'arabic', 'french']
const sections = ['donations', 'skills', 'blogs']
const jsf = require('json-schema-faker')
jsf.extend('faker', () => require('faker'))
const items = []

const minLng = -0.19775390625
const maxLng = 7.492675781249999
const minLat = 29.630771207229
const maxLat = 35.782170703266075
/** */
function getRandomInRange (from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1
}

for (let index = 0; index < 200; index++) {
  const item = jsf.generate(schema)
  item.img = 'https://live.staticflickr.com/3938/15615468856_92275201d5_b.jpg'
  item.div = wilayas[Math.floor(Math.random() * wilayas.length)]
  item.tagsLang = langs[Math.floor(Math.random() * langs.length)]
  item.section = sections[Math.floor(Math.random() * sections.length)]
  item.lat = getRandomInRange(minLat, maxLat, 3)
  item.lng = getRandomInRange(minLng, maxLng, 3)
  item.geolocation = {
    type: 'Point',
    coordinates: [item.lng, item.lat]
  }
  oAuthSampleProfile.email = item.usr
  item.user = oAuthSampleProfile
  items.push(item)
}

const ops = {}
const keys0 = ['NODE_ENV', 'HONEYPOT_KEY', 'PASS', 'PASS2',
  'EMAIL_TO', 'EMAIL_PASS', 'EMAIL_FROM', 'MONGODB_URI',
  'GCLOUD_STORAGE_BUCKET', 'CREDS_PATH', 'AUTH0_CLIENT_ID',
  'AUTH0_DOMAIN', 'AUTH0_CLIENT_SECRET', 'SESSION_SECRET',
  'AUTH0_CALLBACK_URL', 'AUTH0_BASEURL']
const keys1 = ['NODE_ENV', 'LATITUDE', 'LONGITUDE',
  'BORDERS_FILE_URL', 'STATES_FILE_URL', 'GOOGLE_FONT_API']
ops.checkEnvironmentVariables = function checkEnvironmentVariables () {
  if (process.env.NODE_ENV !== 'local') {
    return
  }
  console.log({ level: 'info', message: 'Checking environment variables' })
  const checkKeys = (result, keys) => {
    if (result.error) {
      throw result.error
    }
    const envKeys = Object.keys(result.parsed)
    const check = keys.every((item) => envKeys.includes(item)) && envKeys
      .every((item) => keys.includes(item))
    if (!check) {
      throw Error('Not all keys are present.')
    }
  }
  const dotenv = require('dotenv')
  const result1 = dotenv.config()
  const result2 = dotenv.config({ path: 'client/.env' })
  checkKeys(result1, keys0)
  checkKeys(result2, keys1)
  console.log({ level: 'info', message: 'Environment variables seem to be fine' })
}
const MongoClient = require('mongodb').MongoClient
ops.checkEnvironmentData = async function checkEnvironmentData (url) {
  console.log({ level: 'info', message: 'Checking environment data' })
  return new Promise(function (resolve, reject) {
    // Do not check environment data assuming everything is fine
    // if (process.env.NODE_ENV !== 'local') {
    //   resolve();
    // }
    MongoClient.connect(url, function (err, client) {
    // Use the admin database for the operation
      const adminDb = client.db('local').admin()
      // List all the available databases
      adminDb.listDatabases(async function (err, dbs) {
        const databases = dbs.databases.map((n) => n.name)
        const dbName = process.env.NODE_ENV === 'development'
          ? 'listings_db_dev'
          : 'listings_db'
        const check = databases.indexOf(dbName) >= 0
        if (!check) {
          reject(new Error('Not all databases are present.'))
        }
        await client.connect(async function (err) {
          const db = client.db(dbName)
          db.listCollections().toArray(function (err, collections) {
            const collectionNames = collections.map((n) => n.name)
            const check = (
              collectionNames.indexOf('words') >= 0 &&
            collectionNames.indexOf('listing') >= 0
            )
            if (!check) {
              reject(new Error('Not all collections are present.'))
            }
          })
        })
        client.close()
        console.log({ level: 'info', message: 'Environment data seem to be fine' })
        resolve()
      })
    })
  })
}

// Checks and downloads useful datasets
// These datasets can be host anywhere
ops.checkRawDatasets = function checkRawDatasets () {
  console.log({ level: 'info', message: 'Checking raw datasets' })
  // TODO: files
  console.log({ level: 'info', message: 'Raw datasets seem to be fine' })
}

/**
 * shuffleArray
 * @param {*} array
 */
function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}
const LoremIpsum = require('lorem-ipsum').LoremIpsum
const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
})

ops.seedCommunity = async function seedCommunity (mails) {
  return new Promise(function (resolve, reject) {
    for (let index = 0; index < 100; index++) {
      shuffleArray(mails)
      mailHogTransporter.sendMail({
        from: mails[0],
        to: mails[1],
        subject: lorem.generateWords(4),
        html: (lorem.generateWords(10)),
        text: (lorem.generateWords(10))
      })
    }
  })
}

ops.seedDevelopmenetData = async function seedDevelopmenetData (db) {
  const options = { ordered: true }
  const collection = db.collection('listing')
  return new Promise(function (resolve, reject) {
    collection.insertMany(items, options, async function (err, reply) {
      console.log('Inserted seed data into the collection')
      if (err) {
        return reject(err)
      }
      const mails = await ops.seedMailHogData(db)
      await ops.seedCommunity(mails.emails)
      return resolve(reply)
    })
  })
}

ops.seedMailHogData = async function seedMailHogData (db) {
  const collection = db.collection('listing')
  const collection_ = db.collection('mailhog')

  return new Promise(function (resolve, reject) {
    collection.find({})
      .limit(10)
      .toArray(async function (err, docs) {
        if (err) {
          return reject(err)
        }
        const count = await collection.countDocuments({})
        const emails = docs.map((doc) => doc.usr)
        return resolve({ emails: emails, count: count })
      })
  })
}

ops.createIndexes = async function createIndexes (db) {
  const listingCollection = db.collection('listing')
  await listingCollection.createIndex(
    { title: 'text', desc: 'text' },
    { weights: { title: 3, desc: 1 } }
  )
  await listingCollection.createIndex({ tags: 1 })
  await listingCollection.createIndex({ div: 1 })
  await listingCollection.createIndex({ geolocation: '2dsphere' })
  const userCollection = db.collection('user')
  await userCollection.createIndex({ to: 1, sent: 1 })
}

// TODO: verify skipping deactivated and not yet approved listings
// TODO: Must be in a separate CRON JOB
ops.wordsMapReduce = function wordsMapReduce (db) {
  logger.log({ level: 'info', message: 'Running map reduce' })
  db.collection('words').deleteMany({})
  db.collection('listing').mapReduce(
    function () {
      const document = this
      const stopwords = ['the', 'this', 'and', 'or']
      if (document.d || !document.a) {
        return
      }
      for (const prop in document) {
        if (prop === '_id' || typeof document[prop] !== 'string') {
          continue
        }
        if (prop !== 'title' && prop !== 'desc') {
          continue
        }
        (document[prop]).split(' ').forEach(function (word) {
          const cleaned = word.replace(/[;,.]/g, '')
          if (stopwords.indexOf(cleaned) > -1 ||
              !(isNaN(parseInt(cleaned))) ||
              !(isNaN(parseFloat(cleaned)))) {
            return
          }
          emit(cleaned, document._id)
        })
      }
    },
    function (k, v) {
      const values = {
        documents: []
      }
      v.forEach(function (vs) {
        if (values.documents.indexOf(vs) > -1) {
          return
        }
        values.documents.push(vs)
      })
      return values
    }, {
      finalize: function (key, reducedValue) {
        const finalValue = {
          documents: []
        }
        if (reducedValue.documents) {
          finalValue.documents = reducedValue.documents.filter(
            function (item, pos, self) {
              let loc = -1
              for (let i = 0; i < self.length; i++) {
                if (self[i].valueOf() === item.valueOf()) {
                  loc = i
                  break
                }
              }
              return loc === pos
            })
        } else {
          finalValue.documents.push(reducedValue)
        }
        return finalValue
      },
      out: 'words'
    })
}

module.exports.ops = ops
