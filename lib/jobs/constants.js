/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

//Todo - switch to ids

var log = require('../util/log').from(__filename);

var _id = {
    'arlington, va, united states': 'va',
    'dc-northern-virginia': 'va',

    'san-francisco': 'sf',
    'san francisco, ca, united states': 'sf',

    'product management & user experience': 'product',
    'client services and operations': 'ops',
    'corporate marketing & strategy': 'marketing',
    'general & administrative': 'admin',
    'sales & business development': 'sales',
    'government affairs & legal': 'legal',
    'Consumer Marketing Analytics': 'analytics'
    
};

var _long = {
    va: 'DC/Northern Virginia',
    sf: 'San Fransisco'
};

var _short = {
    va: 'DC/VA',
    sf: 'SF',

    product: 'Product/UX',
    marketing: 'Marketing',
    admin: 'Administrative',
    sales: 'Sales & BD',
    legal: 'Govt & Legal',
    analytics: 'Analytics'
};

var _url = {
    va: 'dc-northern-virgina',
    sf: 'san-francisco'
};

function id(id_) {
    return _id[id_.toLowerCase()] || id_;
}

function long(id_) {
    return  _long[id(id_)];
}

function short(id_) {
    return _short[id(id_)];
}

function url(id_) {
    return _url[id(id_)];
}


module.exports.id = id;
module.exports.long = long;
module.exports.short = short;
module.exports.url = url;