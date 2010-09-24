/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename);

function addHandlers(options) {
    var Server = options.Server;

    Server.get(/^/, function(req, res, next) {
        if (req.query && req.query.jvi) {
            req.session.jvs = req.query.jvs;
        }
        next();
    });

    Server.get(/\/insider\//, function(req, res, next) {
        var matches = req.originalUrl.match(/(.*)\/insider\/([^?/]*)/);
        if (matches && matches.length > 2) {
            var insider = decodeURIComponent(matches[2]).replace(/[^a-zA-Z0-9\.@-]+/gi, ' ').trim(),
                url = matches[1] + (matches[3] ? '/' + matches[3] : '');
            req.session.insider = insider;
            log('insider', insider, 'on', url);
            res.redirect(url);
        }
        else {
            next();
        }
    });



}

function referral_string(session) {
    var referral = [];
    if (session) {
        session.jvs && referral.push(session.jvs);
        session.insider && referral.push('Employee: ' + session.insider);
        session.referral && referral.push('Source: ' + session.referral);
    }
    var string = referral.join(', ');
    if (string) {
        log('referral', string);
    }
    return string;
}

module.exports.addHandlers = addHandlers;
module.exports.generateString = referral_string;