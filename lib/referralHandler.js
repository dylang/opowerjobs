/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename);

function setReferral(req) {
    req.session.referral = req.session.referral || req.headers.referrer || req.headers.referer || false;
    if (req.session.referral && req.session.referral.indexOf('http://' + req.headers.host) === 0) {
        req.session.referral = false;
    }
}

function sessionHandler(req) {
    var gaq_events = [];
    if (req.session) {
        if (!req.session.pageCount) {
            setReferral(req);
            req.session.pageCount = 1;
            req.session.insider && gaq_events.push("_gaq.push(['_trackEvent', 'insider', '" + req.session.insider + "']);");
            req.session.referral && gaq_events.push("_gaq.push(['_trackEvent', 'referral', '" + req.session.referral + "']);");
            req.session.jobboard && gaq_events.push("_gaq.push(['_trackEvent', 'jobboard', '" + req.session.jobboard + "']);");
            if (req.session.insider || req.session.jobboard || req.session.referral && !req.session.tempHost) {
                log('INCOMING', 'http://' + req.headers.host + req.url, req.session.insider || '', req.session.jobboard || '', req.session.referral || '');
            }
        } else {
            req.session.pageCount++;
            gaq_events.push('/* pc: ' + req.session.pageCount + ' */');
        }
    }
    return gaq_events.join('');
}

function jobviteQueryString(req, res, next) {
    if (req.query) {
        if (req.query.jvs) {
            req.session.jobboard = req.query.jvs || req.session.jobboard;
        }
        if (req.query.jvi) {
            var request = req.query.jvi.split(','),
                job_id = request[0],
                action = request[1] ? request[1].toLowerCase() : false;

            if (job_id) {
                res.redirect( (action == 'Apply' ? '/apply/' : '/') + job_id);
                return;
            } 
        }
    }
    next();
}


function insider(req, res, next) {
    var matches = req.originalUrl.match(/(.*)\/insider\/([^?/]*)/);
    if (req.session && matches && matches.length > 2) {
        req.session.insider = decodeURIComponent(matches[2]).replace(/[^a-zA-Z0-9\.@-]+/gi, ' ').trim();
        var url = matches[1] + (matches[3] ? '/' + matches[3] : '/');
        res.redirect(url);
    }
    else {
        next();
    }
}


function referral_string(session, job) {
    var referral = [];
    setReferral(session.req);
    session.insider && referral.push('Insider: ' + session.insider);
    session.jobboard && referral.push('Service: ' + session.jobboard);
    session.referral && referral.push('Via: ' + session.referral);
    session.pageCount > 2 && referral.push('PageCount: ' + session.pageCount);
    var string = referral.join(', ');
    if (string) {
        log('APPLICATION:', job ? job.title + ' ' + job.location : '', session.insider || '', session.jobboard || '', session.referral || '', session.pageCount || '');
    } else {
        log('APPLICATION', job ? job.title + ' ' + job.location : ''); }
    return string;
}


function addHandlers(options) {
    var Server = options.Server;

    Server.helpers({ sessionHandler: sessionHandler });
    Server.get(/\/insider\//, insider);
    Server.get(/^/, jobviteQueryString);
}


module.exports.addHandlers = addHandlers;
module.exports.generateString = referral_string;