const { constraints, donationsSchema, skillsSchema } = require('./constraints')
const { obj, ops } = require('./helpers.js')

// Chain wrapper
function Transformer(s) {
    var internal = String(s)
    this.sanitize = function () {
        internal = ops.sanitize(s);
        return this
    }
    this.cleanSensitive = function () {
        internal = ops.cleanSensitive(s);
        return this
    }
    this.valueOf = function () {
        return internal
    }
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
const expressMiddlewares = []
const uploading = !upload ? true : obj.multer
const securing = !secured ? true : ops.auth0

expressMiddlewares = [uploading, securing]


console.log(new Validator('Bob').isLongerThan(3).evaluate());
console.log(new Validator('Bob').isLongerThan(3, 'or').evaluate());