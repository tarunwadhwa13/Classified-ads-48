// Exposes some data to the HTTP as JSON

const express = require('express')
const { give } = require('../services/helper_data.js')

const router = express.Router()

;[
  ['/get_tags_en', give.googleTagsEn],
  ['/get_tags_ar', give.googleTagsAr],
  ['/get_tags_fr', give.googleTagsFr],
  ['/get_donations_tags_en', give.googleTagsEnLite],
  ['/get_donations_tags_ar', give.googleTagsArLite],
  ['/get_donations_tags_fr', give.googleTagsFrLite],
  ['/get_skills_tags_en', give.ESCOTagsEn],
  ['/get_skills_tags_fr', give.ESCOTagsFr],
  ['/get_skills_tags_ar', give.ESCOTagsAr]
].forEach(([url, tags]) => {
  router.get(url, (req, res) => res.json({ tags }))
})

module.exports = router
