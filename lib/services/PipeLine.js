const { constraints } = require('./constraints.js')
const { obj, ops } = require('./helpers.js')
const borders = require('../../data/geo/country').borders
const ConnectSequence = require('connect-sequence')
const { celebrate, Joi, errors, Segments } = require('celebrate')
const formidable = require('formidable')

// Chain wrapper for Strings
function stringTransformer(s) {
    var internal = String(s)
    this.sanitize = function () {
        internal = ops.sanitize(s)
        return this
    }
    this.cleanSensitive = function () {
        internal = ops.cleanSensitive(s)
        return this
    }
    this.valueOf = function () {
        return internal
    }
}

function PipeLine(data) {
    this.data = data
}
const and = (x, y) => x && y
const or = (x, y) => x || y
const assign = (fn, obj, solution) => obj.value = fn(obj.value, solution)

PipeLine.prototype = {
    value: true,
    // Expects this.data to have a point
    isPointInsidePolygon: function (vs, op) {
        const predicate = (point, vs) => {
            const x = point.lat
            const y = point.lng
            let inside = false
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const xi = vs[i][1]
                const yi = vs[i][0]
                const xj = vs[j][1]
                const yj = vs[j][0]
                const intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
                if (intersect) inside = !inside
            }
            return inside
        }
        const solution = predicate(this.data.point, vs)
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Example: Expects this.data to be String
    isLongerThan: function (len, op) {
        const solution = this.data.length > len
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Expects this.data to have body
    joiValidate: function (schema, op) {
        const predicate = (schema) => {
            return schema.called ? true : schema.def.validate(this.data.body)
        }
        const solution = predicate(schema)
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Expects this.data to have body.undraw
    undrawSplit: function () {
        [this.body.undraw, this.body.color] = this.body.undraw.split('#')
        return this
    },
    // Expects this.data to have body.undraw.color
    undrawJoin: function () {
        this.body.undraw = this.body.undraw + '#' + this.body.undraw.color
        delete this.body.color
        return this
    },
    evaluate: function () {
        return { isTrue: this.value, data: this.data }
    }
}

// Prepare all global variables
const coordinates = borders.features[0].geometry.coordinates[0]
/**
 * Middlewares are `PipeLines` or Express middlewares.
 * Some will be executed in the caller method while 
 * some are evaluated directly and return a boolean and data
 * @param {*} method 
 * @param {*} section 
 * @param {*} body 
 */
// function magicMiddleware(method, section, body) {
async function magicMiddleware(req, res, next) {
    const contentType = req.get('content-type')
    const form = formidable({})
    console.log("magicMiddleware")
    if (contentType.indexOf('multipart/form-data') > -1) {
        await form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(String(err));
                return;
            }
            console.log("magicParser")
            magicMiddleware_(fields)
        })
    } else {
        magicMiddleware_(req)
    }

    const section = req.params[0]
    const method = req.method

    const magicMiddleware_ = (body) => {
        console.log("magicMiddleware_")
        const {
            secured,
            upload,
            geolocation,
            illustrations,
            schema
        } = constraints[process.env.NODE_ENV][method][section]
        singletonSchema = schema()
        const geoValid = !geolocation ? true : new PipeLine({
            point: {
                lat: body.lat,
                lng: body.lng
            }
        })
            .isPointInsidePolygon(coordinates)
            console.log(req.body)
        // .evaluate().isTrue
        const undrawValid = !illustrations ? true : new PipeLine({
            body: body
        }).undrawSplit().joiValidate(singletonSchema).undrawJoin()
        // .evaluate()
        req.locals.magicPipeLine = { geoValid, undrawValid }

        // Third party middlewares
        var seq = new ConnectSequence(req, res, next)
        const validating = celebrate({
            [Segments.BODY]: singletonSchema,
        })
        // if (upload) { 
        //     console.log('attaching multer')
        //     seq.append(ops.multer) 
        // }
        if (!singletonSchema.called) {
            seq.append(validating)
        }
        seq.append(errors())
        if (secured) { 
            console.log('attaching multer')
            seq.append(ops.auth0) 
        }
        seq.run()
        next()
    }
}

/**
 * secured
 * obj.multer.single('avatar')
 * ops.isPointInsidePolygon
 * body.undraw.split('#')
 * isArabic/sanitize/cleanSensitive
 * 
 * tags = JSON.parse(body.tags)
 * body.tags = _.pluck(tags, 'value')
 */

module.exports = PipeLine