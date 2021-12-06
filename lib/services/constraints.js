// Constraints to ease code complexity. These constraints reflect 
// which operations to run on some endpoint on some environment 
const Joi = require('joi')
const {illustrations} = require('./bigToes.js')
const {fontFamilies} = require('./bigToes.js')

const donationsSchema = () => {
    return {
        called: false,
        def: Joi.object().keys({
            title: Joi.string().min(10).max(100).required(),
            // .regex(/^\W*\w+(?:\W+\w+)*\W*$/)
            desc: Joi.string().min(10).max(5000).required(),
            // TODO: limit number of tags to 2
            tags: Joi.array().items(Joi.string().min(3).max(20)).required(),
            lat: Joi.number().max(90).min(-90).optional(),
            lng: Joi.number().max(180).min(-180).optional(),
            div: Joi.string().min(3).max(40).optional(),
            section: Joi.string().valid('donations').required(),
            tagsLang: Joi.string().valid(...['arabic', 'english'])
            // avatar: Joi.string().required()
        })
    }
}

const skillsSchema = () => {
    return {
        called: false,
        def: Joi.object().keys({
            title: Joi.string().min(10).max(100).required(),
            // .regex(/^\W*\w+(?:\W+\w+)*\W*$/)
            desc: Joi.string().min(10).max(5000).required(),
            // TODO: limit number of tags to 2
            tags: Joi.array().items(Joi.string().min(3).max(20)).required(),
            section: Joi.string().valid('skills').required(),
            font: Joi.string().valid(...fontFamilies),
            illu_q: Joi.string().min(2).max(15).required(),
            undraw: Joi.string().valid(...illustrations).optional(),
            color: Joi.string().regex(/^[0-9a-f]{3,10}$/i).optional(),
            // TODO: properly validate this
            img_radio: Joi.string().optional()
            // avatar: Joi.string().required()
        })
    }
}


const constraints = {
    'local': {
        'GET': {},
        'POST': {
            'skills': {
                secured: true,
                upload: true,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema
            },
            'donations': {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: donationsSchema
            }
        }
    },
}

module.exports = { constraints };
