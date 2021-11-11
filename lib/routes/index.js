const express = require('express');
const router = express.Router();
const mongoQueries = require('../mongo_ops').mongoQueries;

/* GET home page. */
router.get('/', async function(req, res, next) {
  const listings = await mongoQueries.getDocumentsSince(
      20, '', req.body.pagination);
  const {page: page, perPage: perPage} = req.body.pagination;
  res.render('index', {
    title: 'Classified-ads-48',
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage),
    // user: req.body.user,
  });
});

router.get('/tag/:tag', async function(req, res, next) {
  const tag = req.params.tag;
  const listings = await mongoQueries.getDocumentsByTag(
      tag, req.body.pagination);
  const {page: page, perPage: perPage} = req.body.pagination;
  res.render('index', {
    title: tag,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage),
  });
});


router.get('/division/:division', async function(req, res, next) {
  const division = req.params.division;
  const listings = await mongoQueries.getDocumentsByDivision(
      division, req.body.pagination);
  const {page: page, perPage: perPage} = req.body.pagination;
  res.render('index', {
    title: division,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage),
  });
});

router.get('/keyword/:keyword', async function(req, res, next) {
  const keyword = req.params.keyword;
  const listings = await mongoQueries.getDocumentsByKeyword(
      keyword, req.body.pagination);
  const {page: page, perPage: perPage} = req.body.pagination;
  res.render('index', {
    title: keyword,
    listings: listings.documents,
    current: page,
    pages: Math.ceil(listings.count / perPage),
  });
});

// Blog pages are pages with little server processing
router.get('/categories', function(req, res, next) {
  res.render('blogs', {
    title: 'Categories',
    sections: [
      {id: 'Donations', html: req.t('Donations')},
      {id: 'Skills', html: req.t('Skills')},
      {id: 'Blogs', html: req.t('Blogs')},
    ],
  });
});

router.get('/about', function(req, res, next) {
  res.render('blogs', {
    title: 'What is Classified-ads-48',
    sections: [
      {id: 'What is', html: req.t('What is')},
      {id: 'Careful', html: req.t('What is, careful')},
    ],
  });
});

router.get('/howto', function(req, res, next) {
  res.render('blogs', {
    title: 'How to post on Listings',
    sections: [
      {id: 'Careful', html: req.t('Careful')},
      {id: 'Login', html: req.t('Login')},
      {id: 'Validation', html: req.t('Validation')},
    ],
  });
});

router.get('/policy', function(req, res, next) {
  res.render('blogs', {
    title: 'Terms of usage',
    sections: [
      {id: 'sec1', html: 'bob'},
      {id: 'sec2', html: 'lorem upsom lorem upsom lorem upsom lorem  '},
      {id: 'sec3', html: 'lorem upsom lorem upsom lorem upsom lorem  '.toUpperCase()},
    ],
  });
});

const svgs = require('../bigToes').svgs;
router.get('/fennec-fox', function(req, res, next) {
  const idx = Math.floor(Math.random() * 4) + 1;
  res.render('easteregg', {
    svg: svgs[idx],
    style: `easteregg-${idx}.css`,
  });
});


module.exports = router;
