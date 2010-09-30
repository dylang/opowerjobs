/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename); //,
/*

    Bitly = new (require('bitly').Bitly)('dylang', 'R_2cdb5b8be9a96310c5c2a3953a911569');

Bitly.shorten('http://opowerjobs.com', function(result) {
  log(result);
});
*/

function setReferral(req, overwrite) {
    var referral = req.session.referral;
    if (!referral || overwrite) {
        referral = req.headers.referrer || req.headers.referer || 'Direct';
        if (referral) {
            if (referral.indexOf('http://' + req.headers.host) === 0) {
                referral = 'Direct';
            }
            referral = referral.replace(/'"/g, '');
        }
        req.session.referral = referral;
    }
}

function sessionHandler(req) {
    var gaq_events = [];
    if (req.session) {
        if (req.session.logInsider && req.session.insider) {
            gaq_events.push("_gaq.push(['_trackEvent', 'insider', '" + req.session.insider + "', '" + req.session.referral + "']);");
            delete req.session.logInsider;
        }

        if (req.session.logJobBoard) {
            gaq_events.push("_gaq.push(['_trackEvent', 'jobboard', '" + req.session.jobboard + "', '" + req.session.referral + "']);");
            delete req.session.logJobBoard;
        }

        if (!req.session.pageCount) {
            req.session.pageCount = 1;
            if ((req.session.insider || req.session.jobboard || req.session.referral) && !req.session.tempHost) {
                log('INCOMING', 'via', req.session.insider || '', req.session.jobboard || '', req.session.referral || '', 'to', 'http://' + req.headers.host + req.url);
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
        if (req.query.jvs || req.query.insider) {
            req.session.jobboard = req.query.jvs || req.query.insider || req.session.jobboard;
            req.session.logJobBoard = true;
            setReferral(req, true);
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
        req.session.logInsider = true;
        setReferral(req, true);
        var url = matches[1] + (matches[3] ? '/' + matches[3] : '/');
        //log('INSIDER', req.session.insider, req.session.referral, 'http://' + req.headers.host + url);
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