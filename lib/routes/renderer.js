// Renderer just maps messages (multilanguale) to routes in different contexts 
// TODO: lets clean up routes using this coupled with i18next
// TODO: revise translations /data/locals
const _ = require('underscore')

module.exports = function render(route, context, data, res) {
    switch (route + "|" + context) {
        case "listings|listings":
            res.render('listings', _.extend({
                title: 'Classified-ads-48',
                intro: 'Classified advertising brought to the web',
                context: 'listings',
                success: 'Hello there :)',
                section: 'index',
            }, data))
            break;
        case "listings|donations":
            res.render('listings', _.extend({

            }, data))
            break;
        case "listings|skills":
            res.render('listings', _.extend({

            }, data))
            break;
        case "listings|blogs":
            res.render('listings', _.extend({

            }, data))
            break;
        case "tags|tags":
            res.render('tags', _.extend({

            }, data))
            break;
        case "listing|id":
            res.render('listing', _.extend({

            }, data))
            break;
        case "listings|gwoogl":
            res.render('listings', _.extend({

            }, data))
            break;
        case "listings|geolocation":
            res.render('listings', _.extend({

            }, data))
            break;
        // Success x)
        case "listing|donations":
            res.render('listing', _.extend({

            }, data))
            break;
        case "listing|skills":
            res.render('listing', _.extend({

            }, data))
            break;
        case "listing|blogs":
            res.render('listing', _.extend({

            }, data))
            break;
        // Unsuccess ;(
        case "listing|donations":
            res.render('messages', _.extend({

            }, data))
            break;
        case "listing|skills":
            res.render('messages', _.extend({

            }, data))
            break;
        case "listing|blogs":
            res.render('messages', _.extend({

            }, data))
            break;
    }
}