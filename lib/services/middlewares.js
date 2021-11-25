const { constraints, donationsSchema, skillsSchema } = require('./constraints')
const {html, reb, rew} = require('./regex.js')
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
                color: htmlRegex.allowedTags,
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