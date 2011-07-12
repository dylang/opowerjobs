/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename);

module.exports.LOCATIONS = {
    va:                 { id: 'va',     short_name: 'DC/VA',   name: 'DC/Northern Virginia',   url: 'dc-northern-virginia'},
    sf:                 { id: 'sf',     short_name: 'SF',      name: 'San Francisco',          url: 'san-francisco'}
};

module.exports.MILLISECONDS_PER_MINUTE = 1000*60;
module.exports.MILLISECONDS_PER_HOUR = 1000*60*60;
module.exports.MILLISECONDS_PER_DAY = 1000*60*60*24;
module.exports.UPDATE_INTERVAL_MINUTES = 20;

var _id = {
    'arlington, va, united states': 'va',
    'dc-northern-virginia': 'va',

    'san-francisco': 'sf',
    'san francisco, ca, united states': 'sf'
};

function id(id_) {
    return _id[id_.toLowerCase()];
}


module.exports.id = id;
