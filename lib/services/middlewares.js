const { constraints, donationsSchema, skillsSchema } = require('./constraints')
const { html, reb, rew } = require('./regex.js')
const sanitizeHtml = require('sanitize-html')

// Chain wrapper
function Transformer(s) {
    var internal = String(s)
    this.sanitize = function () {
        internal = sanitize(s);
        return this
    }
    this.cleanSensitive = function () {
        internal = cleanSensitive(s);
        return this
    }
    this.valueOf = function () {
        return internal
    }
}


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
                color: htmlRegex.allowerColors,
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


function Validator(data) {
    this.data = data;
}
const and = (x, y) => x && y
const or = (x, y) => x || y
const assign = (fn, a, b) => a.value = fn(a.value, b)

Validator.prototype = {
    value: true,
    isPointInsidePolygon: function (vs, op) {
        const predicate = (point, vs) => {
            const x = point.lat; const y = point.lng
            let inside = false
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const xi = vs[i][1]; const yi = vs[i][0]
                const xj = vs[j][1]; const yj = vs[j][0]
                const intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
                if (intersect) inside = !inside
            }
            return inside;
        }
        const solution = predicate(this.data.point, vs)
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this;
    },
    // Example
    isLongerThan: function (len, op) {
        const solution = this.data.length > len
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this;
    },
    evaluate: function () {
        return this.value;
    }
};

// const postListing = () => {
//     const { secured, upload, geolocation, illustrations } =
//         constraints[process.env.NODE_ENV].post.donations
//     if (geolocation) {
//         console.log(new Validator(point)
//             .isPointInsidePolygon(coordinates)
//             .isPointInsidePolygon(coordinates)
//             .evaluate()
//         );
//     }
// }
console.log(new Validator('Bob').isLongerThan(3).evaluate());
console.log(new Validator('Bob').isLongerThan(3, 'or').evaluate());