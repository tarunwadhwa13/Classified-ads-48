const borders = require('../../data/geo/country').borders
const coordinates = borders.features[0].geometry.coordinates[0]
const { constraints } = require('../services/constraints')

function sanitize(str) {
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

function cleanSensitive(blob, maxlen) {
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


// Chain wrapper for Strings
function stringTransformer(s) {
    var internal = String(s)
    this.sanitize = function () {
        internal = sanitize(s)
        return this
    }
    this.cleanSensitive = function () {
        internal = cleanSensitive(s)
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
    // Expects this.data to be a point
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
        const solution = predicate(this.data, vs)
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
    // Example: Expects this.data to be body.tags
    isTagsValid: function (op) {
        let solution = true
        try {
            let tags = JSON.parse(this.data.tags)
            this.data.tags = _.pluck(tags, 'value')
        } catch (error) {
            solution = false
        }
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Expects this.data to be body
    joiValidate: function (schema, op) {
        const predicate = (schema) => {
            return schema.called ? true : schema.def.validate(this.data)
        }
        const solution = predicate(schema)
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Expects this.data to be body.undraw
    undrawSplit: function () {
        [this.data.undraw, this.data.color] = this.data.undraw.split('#')
        return this
    },
    // Expects this.data to be body.undraw.color
    undrawJoin: function () {
        this.data.undraw = this.body.undraw + '#' + this.data.undraw.color
        delete this.data.color
        return this
    },
    evaluate: function () {
        return { isTrue: this.value, data: this.data }
    }
}

// 
function validationPipeLine(req) {
    const { body } = req
    const section = req.params[0]
    const method = req.method

    const {
        secured,
        upload,
        geolocation,
        illustrations,
        schema
    } = constraints[process.env.NODE_ENV][method][section]
    const singletonSchema = schema()

    const geoValid = !geolocation ? true : new PipeLine({
        lat: body.lat,
        lng: body.lng
    }).isPointInsidePolygon(coordinates).evaluate().isTrue

    const undrawValid = !illustrations ? true : new PipeLine(body)
        .undrawSplit().joiValidate(singletonSchema).undrawJoin()

    const tagsValid = !body.tags ? true : new PipeLine(body)
        .isTagsValid().evaluate().isTrue

    // Final validation according to schema / if not yet validated
    const result = singletonSchema.called ? singletonSchema.def.validate(body) : {
        value: null,
        error: null
    }
    const { value, joiError } = result
    return { joiError, tagsValid, geoValid, undrawValid }
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

module.exports = { validationPipeLine, stringTransformer }