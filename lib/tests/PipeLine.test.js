const { validationPipeLine, stringTransformer } = require('../services/PipeLine.js')
const borders = require('../../data/geo/country').borders
const coordinates = borders.features[0].geometry.coordinates[0]

function sum(a, b) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

// function validationPipeLine(req) {
//   const { body } = req
//   const section = req.params[0]
//   const method = req.method

//   const {
//     secured,
//     upload,
//     geolocation,
//     illustrations,
//     schema
//   } = constraints[process.env.NODE_ENV][method][section]
//   const singletonSchema = schema()

//   const geoValid = !geolocation ? true : new PipeLine({
//     lat: body.lat,
//     lng: body.lng
//   }).isPointInsidePolygon(coordinates).evaluate().isTrue

//   const undrawValid = !illustrations ? true : new PipeLine(body)
//     .undrawSplit().joiValidate(singletonSchema).undrawJoin()

//   const tagsValid = !body.tags ? true : new PipeLine(body)
//     .isTagsValid().evaluate().isTrue

//   // Final validation according to schema / if not yet validated
//   const result = singletonSchema.called ? singletonSchema.def.validate(body) : {
//     value: null,
//     error: null
//   }
//   const { value, joiError } = result
//   return { joiError, tagsValid, geoValid, undrawValid }
// }