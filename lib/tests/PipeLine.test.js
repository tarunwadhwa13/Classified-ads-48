/* eslint-disable max-len */

const { PipeLine, stringTransformer } = require('../services/PipeLine.js')
const borders = require('../../data/geo/country').borders
const algeria = borders.features[0].geometry.coordinates[0]
const constraints = require('../services/constraints.js').constraints

test('String transformations', () => {
  let text = '<!DOCTYPE html>  <html>  <body>         <h1>My First Heading</h1>  <p>My first paragraph.</p>  </body>  </html>'
  let textToBe = '<h3>My First Heading</h3> <p>My first paragraph.</p>'
  expect(new stringTransformer(text).sanitize().valueOf()).toBe(textToBe);
  let text2 = '3700 0000 0100 018 Amex 6703 0000 0000 0000 003 BCMC 4001 0200 0000 0009 electron'
  let text2ToBe = 'XXXXXXXXXXXXXXXXXX Amex XXXXXXXXXXXXXXXXXXXXXXX BCMC XXXXXXXXXXXXXXXXXXX electron'
  expect(new stringTransformer(text2).cleanSensitive().valueOf()).toBe(text2ToBe);
});

test('Geolocations pipeline', () => {
  let isInside = new PipeLine({
    lat: '36.7', // Algiers
    lng: '3.05'
  }).isPointInsidePolygon(algeria).evaluate().isTrue
  expect(isInside).toBe(true);
  isInside = new PipeLine({
    lat: '36.8', // Tunis
    lng: '10.19'
  }).isPointInsidePolygon(algeria).evaluate().isTrue
  expect(isInside).toBe(false);
});

test('Validation pipeline', () => {
  let body = 
    {
      title: 'le .',
      desc: 'blablabla blablabl gnagnagna gnagnagni',
      tags: ['tag_wow', 'tag2_wiw', 'tag3_ted', 'tag4_cruz'],
      section: 'skills',
      font: 'Roboto',
      illu_q: '---',
      undraw: 'making_art_759c#ff5733',
      color: '',
      img_radio: '---'
    }
  const schema = constraints.local.POST.skills.schema()
  const res = new PipeLine(body)
    .undrawSplit().joiValidate(schema).postValidate().evaluate()
  console.log(res)
});
