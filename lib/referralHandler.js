/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename);

function addHandlers(options) {
    var Server = options.Server;

    Server.helpers({ sessionHandler: sessionHandler });

    function sessionHandler(req) {
        var gaq_events = [];
        if (req.session) {
            if (!req.session.pageCount) {
                req.session.referral = req.session.referral || req.headers.referrer || req.headers.referer || false;
                req.session.jobboard = req.query && req.query.jvi ? req.query.jvs : false;
                req.session.pageCount = 1;
                req.session.insider && gaq_events.push("_gaq.push(['_trackEvent', 'insider', '" + req.session.insider + "']);");
                req.session.referral && gaq_events.push("_gaq.push(['_trackEvent', 'referral', '" + req.session.referral + "']);");
                req.session.jobboard && gaq_events.push("_gaq.push(['_trackEvent', 'jobboard', '" + req.session.jobboard + "']);");
            } else {
                req.session.pageCount++;
                gaq_events.push('/* pc: ' + req.session.pageCount + ' */');
            }
        }
        return gaq_events.join('');
    }

    Server.get(/\/insider\//, function(req, res, next) {
        var matches = req.originalUrl.match(/(.*)\/insider\/([^?/]*)/);
        if (req.session && matches && matches.length > 2) {
            var insider = decodeURIComponent(matches[2]).replace(/[^a-zA-Z0-9\.@-]+/gi, ' ').trim(),
                url = matches[1] + (matches[3] ? '/' + matches[3] : '/');
            req.session.insider = insider;
            log('Insider', insider, 'on', url);
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
        session.insider && referral.push('Insider: ' + session.insider);
        session.jobboard && referral.push('Service: ' + session.jobboard);
        session.referral && referral.push('Via: ' + session.referral);
        session.pageCount > 2 && referral.push('PageCount: ' + session.pageCount);
    }
    var string = referral.join(', ');
    if (string) {
        log('APPLICATION:', string);
    }
    return string;
}

module.exports.addHandlers = addHandlers;
module.exports.generateString = referral_string;