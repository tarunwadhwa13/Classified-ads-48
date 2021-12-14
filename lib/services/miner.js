const { TopK } = require('bloom-filters')
const FuzzySet = require('fuzzyset')
var adt_1 = require("@toreda/adt")

let fuzzyset
let circularBuffer

/**
 * Caches mined time-indexed data in DB
 */
function cache() {

}

/**
 * Deletes mined data from DB
 */
function uncache() {

}

/**
 * Purges mined data from memory
 */
function refresh() {
    cache()
    fuzzyset = FuzzySet()
    circularBuffer = new adt_1.CircularQueue({
        maxSize: maxSize,
        overwrite: true
    })
}

/**
 * Prepapres data for the calling router
 */
function get() {

}

/**
 * Sets new stream data
 */
 function set() {

}

// arbitrary choice
const maxSize = 3000
circularBuffer = new adt_1.CircularQueue({
    maxSize: maxSize,
    overwrite: true
})

//  REFRESH TOPK
let pushCount = 0
const isHalfSeen = () => ((pushCount++) % maxSize) > maxSize / 2
const purgeOld = () => {
    const front = circularBuffer.front()
    if (front && front.when < new Date().getTime() - 2592000000 /*month*/) {
        circularBuffer.pop()
        purgeOld()
    } else {
        return
    }
}

//  REFRESH TOPK
const checkSimilarity = (keyword) => {
    const similar = fuzzyset.get(keyword)
    if (!similar || (similar[0][0] < 0.8)) {
        fuzzyset.add(keyword)
        return false
    } else {
        return similar[0][1]
    }
}

// REFRESH TOPK
const refreshTopK = (keyword) => {
    purgeOld()
    const similar = checkSimilarity(keyword)
    if (similar)
        keyword = similar
    circularBuffer.push([new Date().getTime(), keyword])
    // when half the queue is seen already
    // renew the topK bag
    if (isHalfSeen()) {
        pushCount = 0
        topk = new TopK(10, 0.001, 0.99)
        circularBuffer.forEach((elem, index, arr) => {
            topk.add(elem[1])
        })
    }
}


// refreshTopK("new search")