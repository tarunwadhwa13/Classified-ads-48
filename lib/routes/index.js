const express = require('express')
const { SVGs } = require('../services/helper_data').give
const { mongoQueries } = require('../services/mongo_ops')
const router = express.Router()

/* GET home page. */
router.get('/', async function (req, res) {
  const listings = await mongoQueries.getDocumentsSince(
    20, '', req.body.pagination)
  const { page, perPage } = req.body.pagination
  res.render('index', {
    title: 'Classified-ads-48',
    context: 'index',
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage)
    // user: req.body.user,
  })
})

router.get('/tag/:tag', async function (req, res) {
  const tag = req.params.tag
  const listings = await mongoQueries.getDocumentsByTag(
    tag, req.body.pagination)
  const { page, perPage } = req.body.pagination
  res.render('index', {
    title: tag,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage)
  })
})

router.get('/division/:division', async function (req, res) {
  const division = req.params.division
  const listings = await mongoQueries.getDocumentsByDivision(
    division, req.body.pagination)
  const { page, perPage } = req.body.pagination
  res.render('index', {
    title: division,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage)
  })
})

router.get('/keyword/:keyword', async function (req, res) {
  const keyword = req.params.keyword
  const listings = await mongoQueries.getDocumentsByKeyword(
    keyword, req.body.pagination)
  const { page, perPage } = req.body.pagination
  res.render('index', {
    title: keyword,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage)
  })
})

// Blog pages are pages with little server processing
router.get('/categories', function (req, res) {
  res.render('blogs', {
    title: 'Categories',
    sections: [
      { id: 'Donations', html: req.t('Donations') },
      { id: 'Skills', html: req.t('Skills') },
      { id: 'Blogs', html: req.t('Blogs') }
    ]
  })
})

router.get('/about', function (req, res) {
  res.render('blogs', {
    title: 'What is Classified-ads-48',
    sections: [
      { id: 'What is', html: req.t('What is') },
      { id: 'Careful', html: req.t('What is, careful') }
    ]
  })
})

router.get('/howto', function (req, res) {
  res.render('blogs', {
    title: 'How to post on Listings',
    sections: [
      { id: 'Careful', html: req.t('Careful') },
      { id: 'Login', html: req.t('Login') },
      { id: 'Validation', html: req.t('Validation') }
    ]
  })
})

router.get('/policy', function (req, res) {
  res.render('blogs', {
    title: 'Terms of usage',
    sections: [
      { id: 'sec1', html: 'bob' },
      { id: 'sec2', html: 'lorem upsom lorem upsom lorem upsom lorem  ' },
      { id: 'sec3', html: 'lorem upsom lorem upsom lorem upsom lorem  '.toUpperCase() }
    ]
  })
})

// Some eastereggs
router.get('/fennec-fox', function (req, res) {
  const idx = Math.floor(Math.random() * 4) + 1
  res.render('easteregg', {
    svg: SVGs[idx - 1],
    style: `easteregg-${idx}.css`
  })
})

// CLONE BASE DATA LIST
let realtimeJSON
// TODO: secure, but doubleSecure (admin)
router.get('/admin', async function (req, res, next) {
  const listings = await mongoQueries.getDocumentsForApproval()
  realtimeJSON = listings.documents
  // realtimeJSON.forEach((a, idx) => a.id = idx+1)
  res.send(realtimeJSON)
})

router.get('/dashboard', function (req, res) {
  res.render('admin', {})
})

// CREATE
router.post('/admin/', function (request, response) {
  console.log('--- POST 200 ---')
  realtimeJSON.push(request.body)
  // Return list
  response.send(realtimeJSON)
})

// UPDATE (Patch for single-cell edit)
// Replace some or all of an existing movie's properties
// Using `patch` instead of `put` to allow partial update
router.patch('/admin/:id', function (request, response) {
  console.log('--- PATCH 200 ---')
  // Early Exit
  if (!Object.keys(request.body).length) {
    response.send('The request object has no options or is not in the correct format (application/json).')
  }
  // Update the target object
  else {
    const match = getMatch(request)
    realtimeJSON[match] = Object.assign({}, realtimeJSON[match], request.body)
    response.send(realtimeJSON)
  }
})

// PUT (For multi-cell edit)
// Replaces record instead of merging (patch)
router.put('/admin/:id', function (request, response) {
  console.log('--- PUT 200 ---')
  const match = getMatch(request)
  realtimeJSON[match] = request.body
  response.send(realtimeJSON)
})

// DELETE
router.delete('/admin/:id', function (request, response) {
  console.log('--- DELETE 200 ---')
  const match = getMatch(request)
  if (match !== -1) realtimeJSON.splice(match, 1)
  response.send(realtimeJSON)
})

function getMatch(req) {
  return realtimeJSON.findIndex((a) => a._id.toString() === req.params.id.toString())
}

module.exports = router
