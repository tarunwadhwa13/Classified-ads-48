/* eslint-disable max-len */
// Renderer just maps messages (multilanguale) to routes in different contexts 
// TODO: lets clean up routes using this coupled with i18next
// TODO: revise translations /data/locals
const _ = require('underscore')

const messages = {
    donations: 'Share or look for used items nextdoor',
    skills: 'Share skills',
    blogs: 'Creative passions, hobbies and passtimes!'
}
/**
 * No variables should be derived from data to fill
 * title, intro, context, success, because these must be predefined
 * in a nice UX
 * @param {*} route abstracts the requested route/ressource
 * @param {*} kind abstracts the response route. An EJS view or an indication of the kind/context of response
 * @param {*} data is the additionnal data to render
 * @param {*} req request object to derive localized messages from
 * @param {*} res response object to deliver messages
 * Examples
 * {post, get}('listings/^\/(donations|skills|blogs)/') => 'listings|donations'
 * post('listings/gwoogl') => 'listings|gwoogl' or 'listings|not found' or 'listings|server error'
 * {post, get}('listings/id/:id/') => 'listing|id' or 'listing|not found' or 'listing|server error'
 * get('listings/tags') => 'tags|tags'
 */
module.exports = function render(route, kind, data, req, res) {
    // No variables should be derived from data to fill
    // title, intro, context, success, because these must be predefined
    // in a nice UX
    switch (route + "|" + kind) {
        case "listings|listings":
            res.render('listings', _.extend({
                title: 'Classified-ads-48',
                intro: 'Classified advertising brought to the web',
                context: 'listings',
                success: 'Hello there :)',
            }, data))
            break;
        case "listings|donations":
            res.render('listings', _.extend({
                title: `Classified-ads-48' -- ${data.section}`,
                intro: messages[data.section],
                context: 'listings',
                success: 'Yep we got some donations :)',
            }, data))
            break;
        case "listings|skills":
            res.render('listings', _.extend({
                title: `Classified-ads-48' -- ${data.section}`,
                intro: messages[data.section],
                context: 'listings',
                success: 'Yep we got some skills :)',
            }, data))
            break;
        case "listings|blogs":
            res.render('listings', _.extend({
                title: `Classified-ads-48' -- ${data.section}`,
                intro: messages[data.section],
                context: 'listings',
                success: 'Yep we got some blogs :)',
            }, data))
            break;
        case "tags|tags":
            res.render('tags', _.extend({
                title: 'Classified-ads-48 -- Collection of tags',
                success: 'Yep we got tags cooked :)'
            }, data))
            break;
        case "listing|id":
            res.render('listing', _.extend({
                title: 'Classified-ads-48 -- One listing',
                success: 'Yep we got the listing :)'
            }, data))
            break;
        case "listing|not found":
            res.render('listing', _.extend({
                title: 'Classified-ads-48',
                message: 'No listing found, it can be deactivated or not approved yet :(',
                error: 'Listing not found'
            }, data))
            break;
        case "listings|gwoogl":
            res.render('listings', _.extend({
                title: 'Classified-ads-48 -- search results',
                intro: 'Classified advertising brought to the web',
                context: 'gwoogl',
                success: 'Yep, we got results for your search :)'
            }, data))
            break;
        case "listings|geolocation":
            res.render('listings', _.extend({
                title: 'Classified-ads-48 -- geolocated results',
                intro: 'Classified advertising brought to the web',
                context: 'geolocation',
                success: 'Yep, we got results for your search :)'
            }, data))
            break;
        // Success x)
        case "listing|donations":
            res.render('listing', _.extend({
                title: `Classified-ads-48 -- ${data.section}`,
                success: 'Success. Here is the password whenever you want to deactivate the listing :)',
                error: 'Image will be loaded shortly!'
            }, data))
            break;
        case "listing|skills":
            res.render('listing', _.extend({
                title: `Classified-ads-48 -- ${data.section}`,
                success: 'Success. Here is the password whenever you want to deactivate the listing :)',
                error: 'Image will be loaded shortly!'
            }, data))
            break;
        case "listing|blogs":
            res.render('listing', _.extend({
                title: `Classified-ads-48 -- ${data.section}`,
                success: 'Success. Here is the password whenever you want to deactivate the listing :)',
                error: 'Image will be loaded shortly!'
            }, data))
            break;
        // Unsuccess ;(
        case "listing|server error":
            res.render('messages', _.extend({
                title: 'Classified-ads-48',
                message: 'Oops, an internal error accured :(',
                error: 'Oops, an internal error accured :('
            }, data))
            break;
        case "listing|contact":
            res.render('messages', _.extend({
                title: 'Classified-ads-48',
                message: 'Oops, an internal error accured :(',
                error: 'Oops, an internal error accured :('
            }, data))
            break;
    }
}