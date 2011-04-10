/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename); //,
/*

    Bitly = new (require('bitly').Bitly)('dylang', 'R_2cdb5b8be9a96310c5c2a3953a911569');

Bitly.shorten('http://opowerjobs.com', function(result) {
  log(result);
});
*/

function setReferral(req, overwrite) {
    var referral = req.session.referral;
    if (!referral || overwrite) {
        referral = req.header('referer') || 'Direct';
        if (referral) {
            if (referral.indexOf('http://' + req.headers.host) === 0) {
                referral = 'Direct';
            }
            referral = referral.replace(/'"/g, '');
        }
        req.session.referral = referral;
    }
}

function tracking_events(req, res) {
    var gaq_events = [];
    if (req.session) {
        if (req.session.logInsider && req.session.insider) {
            gaq_events.push("_gaq.push(['_trackEvent', 'ad', '" + req.session.insider + "', '" + req.session.referral + "']);");
            delete req.session.logInsider;
        }

        if (req.session.logJobBoard) {
            gaq_events.push("_gaq.push(['_trackEvent', 'jobboard', '" + req.session.jobboard + "', '" + req.session.referral + "']);");
            delete req.session.logJobBoard;
        }

        if (!req.session.pageCount) {
            req.session.pageCount = 1;
            setReferral(req);
            if ((req.session.insider || req.session.jobboard || (req.session.referral && req.session.referral != 'Direct')) && !req.session.tempHost) {
                log('INCOMING', 'via', req.session.insider || '', req.session.jobboard || '', req.session.referral || '', 'to',  req.url);
            }
        } else {
            req.session.pageCount++;
            //gaq_events.push('//pc: ' + req.session.pageCount + '');
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
        var url = matches[1] + (matches[3] ? '/' + matches[3] : '/');
        track_insider(req, decodeURIComponent(matches[2]).replace(/[^a-zA-Z0-9\.@-]+/gi, ' ').trim());
        log('opowerjobs ad', req.session.insider, req.session.referral, url);
        res.redirect(url);
    }
    else {
        next();
    }
}

function track_insider(req, insider) {
    req.session.insider = insider;
    req.session.logInsider = true;
    setReferral(req, true);
}

function metro_ad(req, res, next) {
    track_insider(req, 'DC.Metro.Ad');
    log('DC Metro Ad', req.session.referral);
    next();
}


function referral_string(session, job) {
    var referral = [];
    setReferral(session.req);
    session.insider && referral.push('opowerjobs ad ' + session.insider.replace(/\./g, ' '));
    session.jobboard && referral.push(session.jobboard);
    referral.length && session.referral != 'Direct' && session.referral.indexOf('http://opower.com') < 0 && session.referral.indexOf('http://www.opower.com') < 0 && referral.push( session.referral);
    var string = referral.join(' ');
    log('APPLICATION', job ? job.title + ' ' + job.location : '', string || session.referral, 'Pages:', session.pageCount || 0);
    return string;
}


function addHandlers(options) {
    var Server = options.Server;

    Server.dynamicHelpers({
        tracking_events: tracking_events
    });
    Server.get('/hiring', metro_ad);
    Server.get(/\/insider\//, insider);
    Server.get(/^/, jobviteQueryString);
}


module.exports.addHandlers = addHandlers;
module.exports.generateString = referral_string;