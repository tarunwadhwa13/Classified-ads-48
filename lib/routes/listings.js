// TODO: revise redirects to /messages
// TODO: work initials (usr) should be user.email
// TODO: re-check where to return for res.render and res.json cases
// for instance, if there is work after render (async upload) do not return
// However never run two successive render/json functions.
const { format } = require('util')
const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const _ = require('underscore')
const Joi = require('joi')
const { Storage } = require('@google-cloud/storage')
const { messages } = require('../services/bigToes.js')
const { mongoQueries } = require('../services/mongo_ops.js')
const { obj, ops } = require('../services/helpers.js')
const {
  validationPipeLine,
  stringTransformer,
  makeRenderer,
  secure
} = require('../services/PipeLine.js')
dotenv.config()

const router = express.Router()

router.get('/', makeRenderer, async function (req, res, next) {
  const listings = await mongoQueries.getDocumentsSince(
    20, '', req.body.pagination)
  const { page, perPage } = req.body.pagination
  const data = {
    listings: listings.documents,
    addressPoints: [],
    current: page,
    pages: Math.ceil(listings.count / perPage)
  }
  res.locals.renderer(data, 'listings', 'listings')
})

router.get(/^\/(donations|skills|blogs)/, makeRenderer, async function (req, res, next) {
  const section = req.params[0]
  const listings = await mongoQueries.getDocumentsSince(
    100, section, req.body.pagination)
  const { page, perPage } = req.body.pagination
  const data = {
    section: section,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage),
    addressPoints: []
  }
  data.addressPoints = listings.documents.map((a) => {
    return [a.lat, a.lng, a.title, a._id]
  })
  res.locals.renderer(data, 'listings', section)
})

router.get('/tags', function (req, res, next) {
  res.locals.renderer({}, 'tags', 'tags')
})

/* GET one listing; must not be deactivated. */
router.get('/id/:id/', async function (req, res, next) {
  const hex = /[0-9A-Fa-f]{6}/g
  const elem = (hex.test(req.params.id))
    ? await mongoQueries.getDocumentById(req.params.id, false)
    : undefined

  if (elem) {
    const peer2 = elem.usr;
    elem.usr = elem.usr ? ops.initials(elem.usr) : 'YY'
    let messages = []
    if (req.oidc.isAuthenticated()) {
      peer1 = req.oidc.user.email
      messages = await mongoQueries.getMessages(peer1, peer2, req.params.id)
      messages.forEach(message => {
        message.from = ops.initials(message.from)
        message.to = ops.initials(message.to)
      });
    }
    const data = { data: elem, section: elem.section, messages: messages, author: peer2 }
    res.locals.renderer(data, 'listing', 'id')
    return
  }
  res.locals.renderer(data, 'listing', 'not found')
})

/* Query listings not including deactivated. */
router.post('/gwoogl', async (req, res, next) => {
  const { body } = req
  const querySchema = Joi.object().keys({
    title_desc: Joi
      .string()
      .optional()
      .allow('')
      .min(3)
      .max(100),
    exact: Joi.boolean().truthy('on').falsy('off').default(false),
    // .regex(/^\W*\w+(?:\W+\w+)*\W*$/),
    div_q: Joi.string().allow('').min(3).max(40).optional(),
    since: Joi.date().iso(),
    section: Joi.string().valid(...['donations', 'skills'])
  })

  const result = querySchema.validate(body)
  const { error } = result
  const valid = error == null
  let listings
  if (!valid) {
    return res.status(422).json({
      message: 'Invalid request',
      data: body,
      error: error
    })
  } else {
    listings = await mongoQueries.gwoogl(body.title_desc,
      body.exact, body.div_q, body.section)
  }
  const data = { section: body.section, addressPoints: [], listings: listings }
  res.locals.renderer(data, 'listings', 'gwoogl')
})

/* Query listings withing a geopoint and radius */
router.post('/geolocation', async (req, res) => {
  const { body } = req
  const querySchema = Joi.object().keys({
    lat: Joi.number().max(90).min(-90),
    lng: Joi.number().max(180).min(-180),
    section: Joi.string().valid(...['donations', 'skills'])
  })

  const result = querySchema.validate(body)
  const { value, error } = result
  const valid = error == null
  let listings
  if (!valid) {
    return res.status(422).json({
      message: 'Invalid request',
      data: body,
      error: error
    })
  } else {
    listings = await mongoQueries.getDocumentsByGeolocation(
      body.lat, body.lng, body.section)
  }
  const data = { section: body.section, listings: listings, addressPoints: [] }
  res.locals.renderer(data, 'listings', 'geolocation')
})

/* Add one listing. */

const arabic = /[\u0600-\u06FF]/g

/**
 * Detects if String is Arabic, if ration of arabic characters count is at least 0.5
 * @param {string} str The first number.
 * @return {boolean} isArabic or null.
 */
function isArabic(str) {
  const count = str.match(arabic)
  return count && ((count.length / str.length) > 0.5)
}

const storage = new Storage({ keyFilename: process.env.CREDS_PATH })
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)

// TODO: probably use the cleaner magicMiddleware
router.post(/^\/(donations|skills|blogs)/,
  ops.multer, secure,
  async (req, res, next) => {
    const { body } = req
    const section = req.params[0]
    const { joiError, tagsValid, geoValid, undrawValid } = validationPipeLine(req)
    const valid = (joiError == null) && tagsValid && geoValid && undrawValid
    if (!valid) {
      res.status(422).json({
        message: 'Invalid request',
        data: body,
        error: joiError
      })
    } else {
      // TODO remove password
      const password = (Math.random().toString(36).substr(4)).slice(0, 9)
      // TODO: make it chain functions like a pipeline of string filters.
      const htmlCleanDesc = ops.sanitize(body.desc)
      const maskedDesc = ops.cleanSensitive(htmlCleanDesc)
      body.desc = maskedDesc

      // Upload that damn picture
      // Create a new blob in the bucket and upload the file data.
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      // Files other than images are undefined
      if (!req.file) {
        return res.status(422).json({
          message: 'Invalid request',
          data: body,
          error: 'file not found'
        })
      }
      const filename = uniqueSuffix + path.extname(req.file.originalname)
      const blob = bucket.file(filename)
      const blobStream = blob.createWriteStream()
      blobStream.on('error', (err) => {
        next(err)
      })
      blobStream.on('finish', async () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        )
        if (section === 'skills') {
          delete body.illu_q
          delete body.img_radio
        }
        const entry = _.extend(body, {
          pass: password,
          d: false,
          a: false,
          img: publicUrl,
          usr: req.oidc.user.email,
          usr_profile: req.oidc.user,
          ara: isArabic(maskedDesc)
        })
        let entry_ = await mongoQueries.insertDocument(entry)
        entry_ = JSON.parse(JSON.stringify(entry_))
        ops.toAdminMail(messages.approve.en(adminPass, entry_._id)).then((value) => {
          const data = { data: entry_ }
          res.locals.renderer(data, 'listing', section)
        }).catch((err) => {
          res.locals.renderer({}, 'listing', 'server error')
        })
      })
      blobStream.end(req.file.buffer)
    }
  })

/* Deactivate one listing. */
router.post('/deactivate', async function (req, res, next) {
  const { body } = req
  const listing = Joi.object().keys({
    password: Joi.string().min(6).max(9).required()
  })
  const result = listing.validate(body)
  const { value, error } = result
  const valid = error == null
  if (!valid) {
    res.status(422).json({
      message: 'Invalid request',
      data: body,
      error: error
    })
  } else {
    const id = await mongoQueries.deactivateDocument(body.password)
    // TODO: render the other case
    const io = req.app.get('socketio')
    io.emit('broadcast', id)
    res.render('messages', {
      title: 'Express',
      message: 'Item deactivated',
      success: 'Listing has been successfully deactivated. ' +
        'Users will not see it again :)'
    })
  }
})

const adminPass = process.env.PASS

/* Admin Checks one listing; */
router.get(`/check/${adminPass}/:id`, async function (req, res, next) {
  const hex = /[0-9A-Fa-f]{6}/g
  const elem = (hex.test(req.params.id))
    ? await mongoQueries.getDocumentById(req.params.id, true)
    : undefined
  if (elem) {
    elem.usr = elem.usr ? ops.initials(elem.usr) : 'YY'
    return res.render('listing', {
      title: 'Check',
      data: elem,
      success: 'Admin check :)',
      section: elem.section
    })
  }
  // elem is empty or password is not correct
  res.render('messages', {
    title: 'Check',
    message: 'No listing found :(',
    error: 'No listing found :('
  })
})
// TODO: twilio check

/* Admin Approves one listing. */
router.get(`/approve/${adminPass}/:id`, async function (req, res, next) {
  try {
    const success = await mongoQueries.approveDocument(req.params.id)
    res.render('messages', {
      title: 'Approve',
      message: 'Item approval',
      success: 'Listing has been successfully approved :)'
    })
  } catch (error) {
    res.render('messages', {
      title: 'Approve',
      message: 'Item approval',
      error: 'Listing not found or already approved'
    })
  }
})

/* GET one deactivated listing; Asking user to reactivate before delete. */
router.get('/reactivate/:pass/:id', async function (req, res, next) {
  const hex = /[0-9A-Fa-f]{6}/g
  const elem = (hex.test(req.params.id))
    ? await mongoQueries.getDocumentById(req.params.id, true)
    : undefined
  if (elem) {
    elem.usr = elem.usr ? ops.initials(elem.usr) : 'YY'
    const pass = ops.hashCode(elem.pass + elem._id.str)
    if (pass === req.params.pass) {
      return res.render('listing', {
        title: 'Reactivate',
        data: elem,
        success: 'You can enter your secret code to reactivate :)',
        section: elem.section
      })
    }
  }
  // elem is empty or password is not correct
  res.render('messages', {
    title: 'Reactivate',
    message: 'No listing found :( it can be already active or not found',
    error: 'No listing found :( it can be already active or not found'
  })
})

/* Reactivate one listing. */
// TODO: send email with /reactivate/
// where pass === item.pass to usr
router.post('/reactivate', async function (req, res, next) {
  const { body } = req
  const listing = Joi.object().keys({
    password: Joi.string().min(6).max(9).required()
  })
  const result = listing.validate(body)
  const { value, error } = result
  const valid = error == null
  if (!valid) {
    res.status(422).json({
      message: 'Invalid request',
      data: body,
      error: error
    })
  } else {
    try {
      const success = await mongoQueries.reactivateDocument(body.password)
      res.render('messages', {
        title: 'Express',
        message: 'Item reactivation',
        success: 'Listing has been successfully reactivated. Users can see it again :)'
      })
    } catch (error) {
      res.render('messages', {
        title: 'Express',
        message: 'Item reactivation',
        error: 'Listing not found or already active'
      })
    }
  }
})

/* Contact poster one listing. */
router.post('/id/:id/contact',
  secure,
  async function (req, res, next) {
    const hex = /[0-9A-Fa-f]{6}/g
    const elem = (hex.test(req.params.id))
      ? await mongoQueries.getDocumentById(req.params.id, false)
      : undefined
    if (!elem) {
      return res.render('messages', {
        title: 'Express',
        message: 'No listing found, it can be deactivated or not approved yet :(',
        error: 'Listing not found'
      })
    }
    const { body } = req
    const listing = Joi.object().keys({
      message: Joi.string().min(20).required()
    })
    const result = listing.validate(body)
    const { value, error } = result
    const valid = error == null
    if (!valid) {
      return res.status(422).json({
        message: 'Invalid request',
        data: body,
        error: error
      })
    } else {
      const mail = {
        message: body.message,
        EMAIL_SENDER: req.oidc.user.email,
        EMAIL_RECIEVER: elem.usr,
        subjectId: req.params.id
      }
      ops.toMailHog(mail).then(async (value) => {
        const msg = {
          from: req.oidc.user.email,
          to: elem.usr,
          sent: new Date(),
          thread: req.params.id,
          message: body.message
        }
        const entry_ = await mongoQueries.insertMessage(msg)
        res.render('messages', {
          title: 'messages',
          message: 'Email successfully sent to publisher, he may repond to you.',
          success: 'Email successfully sent to publisher'
        })
      }).catch((err) => {
        res.render('messages', {
          title: 'Express',
          message: 'Email has not been sent',
          error: 'Oops, an internal error accured :('
        })
      })
    }
  })

/* TODO: throttle this and limit requests to > 3 chars */
router.get('/autocomplete/:keyword', async function (req, res, next) {
  const keyword = req.params.keyword
  const elems = await mongoQueries.autocomplete(keyword)
  if (elems) {
    return res.status(200).json(elems)
  }
  res.render('messages', {
    title: 'Express',
    message: 'No listing found, it can be deactivated or not approved yet :(',
    error: 'Listing not found'
  })
})

router.get('/user',
  /* global.passwordless.restricted({failureRedirect: '/login'}), */
  secure,
  async function (req, res, next) {
    const listings = await mongoQueries.getDocumentsByUser(req.oidc.user.email)
    res.render(
      'listings',
      {
        title: 'Your listings',
        intro: 'Classified advertising brought to the web',
        listings: listings,
        success: 'Yep, we got some :)'
      })
  })

module.exports = router
