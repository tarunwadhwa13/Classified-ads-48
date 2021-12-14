const dotenv = require('dotenv')
const fs = require('fs')
const sanitizeHtml = require('sanitize-html')
const Multer = require('multer')
const nodemailer = require('nodemailer')
const { OUTLOOK } = require('../../consts.js')
const { logger, mailHogTransporter } = require('../../pipes.js')
const borders = require('../../data/geo/country').borders
const { html, reb, rew } = require('./regex.js')

const ops = {}
const obj = {}
dotenv.config()

// Initiate Multer Object (a middleware for handling multipart/form-data),
// when env is not monkey chaos
ops.multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024 // no larger than 3mb.
  },
  // Makes req.file undefined in request if not a valid image file.
  fileFilter: (req, file, cb) => {
    console.log('fileFilter')
    console.log(req.body)
    if (file.mimetype == 'image/png' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/jpeg') {
      cb(null, true)
    } else {
      // cb(null, false)
      req.error = 'Only .png, .jpg and .jpeg allowed'
      return cb(null, false, new Error('Only .png, .jpg and .jpeg format allowed!'))
    }
  }
}).single('avatar')

/**
 * Limit HTML tags of a listings description
 * @param {String} str
 * @return {String}
 */
ops.sanitize = function sanitize (str) {
  const search1 = 'h1'
  const replacer1 = new RegExp(search1, 'g')
  const search2 = 'h2'
  const replacer2 = new RegExp(search2, 'g')
  str = str.replace(replacer1, 'h3').replace(replacer2, 'h4')
  return sanitizeHtml(str, {
      allowedTags: html.allowedTags,
      allowedAttributes: {
          span: ['style'],
          a: ['href', 'name', 'target']
      },
      allowedStyles: {
          '*': {
              // Match HEX and RGB
              color: html.allowerColors,
              'text-align': [/^left$/, /^right$/, /^center$/],
              // Match any number with px, em, or %
              'font-size': [/^\d+(?:px|em|%)$/]
          },
          span: {
              'font-size': [/^\d+rem$/],
              'background-color': [/^pink$/]
          }
      }
  })
}

/**
 * Clean sensitive data like: CB number, Phone num, ... Mask sensitive with XXX
 * Based on Richard's Ramblings Regex patterns.
 * Author: Anthony Goldman
 * Source: github.com/jaideepchilukuri/aideepch/blob/
 * 2bd3d43adbbf951d07420d9dac944a2f5eec76a8/
 * tools/maintainance/EJS/emptyconfigs/19.11.0/src/survey/surveyutils.js
 * @param {String} blob blob String text blob to be cleaned up.
 * @param {Number} maxlen
 * @return {String}
 */
ops.cleanSensitive = function cleanSensitive (blob, maxlen) {
  if (maxlen === 0) {
      return ''
  }
  if (maxlen < 9) {
      return blob
  }
  if (blob.length > 9) {
      const whitelisted = []
      for (const regexw in rew) {
          if (Object.prototype.hasOwnProperty.call(rew, regexw)) {
              blob = blob.replace(
                  rew[regexw],
                  function (match, index) {
                      this.push({ i: index, m: match })
                      return ''
                  }.bind(whitelisted)
              )
          }
      }
      const maskStr = (match) => new Array(match.length + 1).join('X')
      for (const regexb in reb) {
          if (Object.prototype.hasOwnProperty.call(reb, regexb)) {
              blob = blob.replace(reb[regexb], maskStr)
          }
      }
      whitelisted.forEach((w) => {
          blob = blob.slice(0, w.i) + w.m + blob.slice(w.i)
      })
  }
  if (maxlen && blob.length >= this.maxlen) {
      blob = blob.substr(0, this.maxlen - 1)
  }
  return blob
}

// TODO: reference to context: change text formatting of emails
/**
 * Returns a beautiful HTML message out of raw message
 * @param {string} msgContent
 * @return {string}
 */
function formatMessage (msgContent) {
  return '<h1> Listings </h1> <br> <h2> A user sent you a message ! </h2> ' +
  `<p> ${msgContent} </p> <br><hr> <code> You can repond directly to this email. </code>`
}

/**
 * Hash https://werxltd.com/wp/2010/05/13/
 * javascript-implementation-of-javas-string-hashcode-method/
 * @param {String} s
 * @return {String}
 */
ops.hashCode = function hashCode (s) {
  let hash = 0; let i; let chr
  if (s.length === 0) return hash
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}



ops.readJSON = function readJSON (path) {
  const rawdata = fs.readFileSync(path)
  const data = JSON.parse(rawdata)
  return data
}

const EMAIL_TO = process.env.EMAIL_TO
const EMAIL_PASS = process.env.EMAIL_PASS
const EMAIL_FROM = process.env.EMAIL_FROM
const transportOptions = {
  pool: true,
  host: OUTLOOK.MAIL_SERVER,
  port: OUTLOOK.SMTP_PORT,
  secure: false,
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASS
  },
  tls: OUTLOOK.TLS
}
const transporter = nodemailer.createTransport(transportOptions)
transporter.verify(function (error, success) {
  if (error) {
    logger.log({ level: 'error', message: error.message })
  } else {
    logger.log({ level: 'info', message: 'Messaging server ready' })
  }
})

/**
 * Send an email using Outlook options
 * From Admin to admins (for post validation)
 * @param {string} message HTML content
 * @return {Promise}
 */
ops.toAdminMail = function toAdminMail (message) {
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: '@@LISTINGS@@',
      html: message,
      text: message,
      replyTo: EMAIL_FROM
    }, (err, info) => {
      if (err) {
        logger.log({ level: 'error', message: 'message envelope: ' + info.messageId })
        logger.log({ level: 'error', message: 'message envelope: ' + info.envelope })
        resolve(err)
      } else {
        resolve()
      };
    })
  })
}

/**
 * Send an email using Outlook options
 * From Admin to user
 * @param {string} message HTML content
 * @param {string} user User email
 * @return {Promise}
 */
ops.toUserMail = function toUserMail (message, user) {
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from: EMAIL_FROM,
      to: user,
      subject: '@@LISTINGS@@',
      html: message,
      text: message,
      replyTo: EMAIL_FROM
    }, (err, info) => {
      if (err) {
        logger.log({ level: 'error', message: 'message envelope: ' + info.messageId })
        logger.log({ level: 'error', message: 'message envelope: ' + info.envelope })
        resolve(false)
      } else {
        resolve(true)
      };
    })
  })
}

/**
 * Send an email to mailHog,
 * @param {string} message HTML content
 * @return {Promise}
 */
ops.toMailHog = function toMailHog ({ message, EMAIL_SENDER, EMAIL_RECIEVER, subjectId }) {
  return new Promise((resolve, reject) => {
    mailHogTransporter.sendMail({
      from: EMAIL_SENDER,
      to: EMAIL_RECIEVER,
      inReplyTo: subjectId,
      subject: '@@LISTINGS@@',
      html: formatMessage(message),
      text: formatMessage(message)
    }, (err, info) => {
      if (err) {
        logger.log({ level: 'error', message: 'message envelope: ' + info.messageId })
        logger.log({ level: 'error', message: 'message envelope: ' + info.envelope })
        resolve(false)
      } else {
        resolve(true)
      };
    })
  })
}


// transform geojson coordinates into an array of L.LatLng
const coordinates = borders.features[0].geometry.coordinates[0]

/**
 * Check if point is inside a Polygon
 * @param {{lat, lng}} point a geopoint to be checked agains vs
 * @param {*} vs Coordinates which is a polygone,
 * that represents country borders defined in ../data/
 * @return {Boolean}
 */
ops.isPointInsidePolygon = function isPointInsidePolygon (point, vs = coordinates) {
  const x = point.lat; const y = point.lng

  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][1]; const yi = vs[i][0]
    const xj = vs[j][1]; const yj = vs[j][0]

    const intersect = ((yi > y) != (yj > y)) &&
         (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Generate initials from an email string
 * Like "sracer2024@yahoo.com" => "S2"
 * @param {String} email
 * @return {String}
 */
ops.initials = function initials (email) {
  email = email.split('@')[0].replace(/[0-9]/g, '').split(/[.\-_]/) || []
  if (email.length == 1) {
    return email[0].slice(0, 2).toUpperCase()
  }
  email = (
    (email.shift()[0] || '') + (email.pop()[0] || '')
  ).toUpperCase()
  return email
}

module.exports = {obj, ops}