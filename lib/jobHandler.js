/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename),
    Jobvite = require('jobvite'),
    jobDAO = Jobvite.Jobs,
    jobData,
    Constants = require('./jobs/constants'),
    team_pages = require('./jobs/team_pages'),
    ReferralHandler = require('./referralHandler'),
    Server;


var view_dir = 'jobs',
    PAGE_ID = 'jobs',
    MINUTES_UNTIL_NEXT_UPDATE = 20; /* every 20 minutes */ 

function data_to_template() {
    Server.helpers({
        jobs: jobData.all_jobs,
        all_teams: jobData.all_teams,
        all_ids: jobData.all_ids,
        all_critical: jobData.all_critical,
        all_new: jobData.all_new,
        Constants: Constants
    });

}


function reload(callback) {
    jobDAO.reload(function(changes) {
        var data = jobDAO.data();
        if (data) {
            jobData = data;
            data_to_template();

        }
        callback && callback(changes);
    }, false);

}

//app.get('/reload' 
function reload_from_jobvite(req, res, next) {
    reload(function(changes) {
        res.render('reload.ejs', { locals: { title: 'Complete', message: 'Done loading jobs.', changes: changes, currentPageID: 'jobs' } });
    })
}

function auto_reload() {
    reload(function(data) {
        log('next update in', MINUTES_UNTIL_NEXT_UPDATE, 'minutes');
        setTimeout(auto_reload, MINUTES_UNTIL_NEXT_UPDATE * 60000);
    })
}

//app.get('/search/:query'
function render_search(req, res, next) {
    var query = req.params.query;
    if (!query) { next(); }
    var jobs = jobDAO.search(query);
    if (!jobs.length) {
        log('No jobs for search: ' + query);
    }
    res.render(view_dir + '/search.ejs', { locals: { jobs: jobs, query: query, title: 'Search for ' + query, currentPageID: PAGE_ID } });
}


//app.get('/search/:query/json'
function search_json(req, res) {

    var query = req.params.query;

    var jobs = jobDAO.search(query),
        total_results = Math.min(jobs.length, 10),
        results = [];

    for (var i = 0; i < total_results; i++) {
        var d = jobs[i];
        results.push({title: d.title, location: Constants.short(d.location), url: d.url.long_url });
    }

    results.push({ count: jobs.length, url: '/search/' + query });
    res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });
}


function render_sf(req, res, next) {
    var jobs = jobData.all_jobs.sf;
    res.render(view_dir + '/locations/sf.ejs', { locals: { jobs: jobs, title: Constants.long('sf'), currentPageID: PAGE_ID } });
}

function render_dc(req, res, next) {
    var jobs = jobData.all_jobs.va;
    res.render(view_dir + '/locations/dc.ejs', { locals: { jobs: jobs, title: Constants.long('va'), currentPageID: PAGE_ID } });
}

//app.get('/all'
function render_all(req, res, next) {
    res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobData.all_jobs, title: 'All Openings', currentPageID: 'all' } });
}
//app.get('/new'
function render_new(req, res, next) {
    res.render(view_dir + '/new.ejs', { locals: { currentPageID: PAGE_ID, title: 'New Positions' } });
}

//app.get('/hot'
function render_hot(req, res, next) {
    res.render(view_dir + '/hot.ejs', { locals: { currentPageID: PAGE_ID, title: 'Hot Positions' } });
}


//app.get('/:location/:team'
function render_team(req, res, next) {
    var team = req.params.team,
        location = req.params.location;

    if (location && jobData.all_teams[team]) {
        res.redirect('/' + team);
    }

    if (!jobData.all_teams[team]) {
        next();
    }
    else {
        //render just one team
        var jobs_sf = jobDAO.team(team, 'sf'),
            jobs_dc = jobDAO.team(team, 'va');

        var team_page = team_pages[team] || 'generic-team-page';
        res.render(view_dir + '/team.ejs', { locals: { team_page: team_page, jobs_sf: jobs_sf, jobs_dc: jobs_dc, team: team, currentPageID: PAGE_ID } });
    }

}

function lookup_longurl(req) {

    var job,
        long_url = ['', req.params.location, req.params.team, req.params.title].join('/').toLowerCase().replace(/\/+$/, '');

    if (jobData.all_urls[long_url]) {
        job =jobData.all_ids[ jobData.all_urls[long_url] ];
    }

    if (!job) {
        //log('no job with id: ' + long_url + ' or ' + req.params.id);
    }
    return job;
}

function lookup_id(req) {
    var job;
    if (req.params.id) {
        job = jobData.all_ids[ req.params.id ] || jobData.all_ids[ jobData.all_urls['/' + req.params.id ] ];
    }
    return job;
}


//app.get('/:location/:team/:title'
function render_job(req, res, next) {
    var job = lookup_id(req);
    if (job) {
        res.redirect(job.url.long_url);
    }
    else {
        job = lookup_longurl(req);
        if (job) {
            res.render(view_dir + '/job.ejs', { locals: { job: job, currentPageID: PAGE_ID } });
        } else {
            next();
        }
    }
}



function render_apply(req, res, next) {
    res.render(view_dir + '/jobvite-apply.ejs', { locals: { title: 'Apply', referral: ReferralHandler.generateString(req.session), currentPageID: PAGE_ID } });
}

function render_apply_job(req, res, next) {
    var job = lookup_id(req);
    if (job) {
        res.redirect('/apply' + job.url.long_url);
    }
    else
    {
        job = lookup_longurl(req);
        if (job) {
            res.render(view_dir + '/jobvite-apply.ejs', { locals: { job: job, title: 'Apply', referral: ReferralHandler.generateString(req.session, job), currentPageID: PAGE_ID } });
        } else {
            next();
        }
    }
}

function render_teams(req, res) {
    res.render(view_dir + '/teams.ejs', { locals: { title: 'Teams', currentPageID: 'teams' } } );
}


function render_feedburner(req, res, next) {
    /* FeedBurner|FeedValidator is hosting it, but when they request the feed they will get the real feed. */
    if ((req.headers['user-agent'] && req.headers['user-agent'].match(/FeedBurner|FeedValidator/i) === null) && req.headers.host.split(':')[0] != 'localhost') {
        res.redirect('http://feeds.feedburner.com/opowerjobs');
    } else {
        next();
    }
}

function render_feed(req, res, next) {
    res.contentType('atom.xml');
    res.render(view_dir + '/atom.ejs', {
        layout: false,
        locals: {
            url: 'http://opowerjobs.com'
        }
    } );
}

function resize_iframe(req, res) {
    res.render(view_dir + '/jobvite-resize-iframe.ejs', {
        layout: false
    });
}

function addHandlers(options) {
    Server = options.Server;
    Server.get('/resize-iframe.html', resize_iframe);
    Server.get('/reload', reload_from_jobvite);
    Server.get('/jobs', render_all);
    Server.get('/all', render_all);
    Server.get('/new', render_new);
    Server.get('/hot', render_hot);
    Server.get('atom.xml', render_feedburner);
    Server.get(/.*\.xml$/, render_feed);

    Server.get('/search/:query/json', search_json);
    Server.get('/search/:query', render_search);

    Server.get('/teams', render_teams);
    Server.get('/san-francisco', render_sf);
    Server.get('/dc-northern-virginia', render_dc);

    Server.get('/:team', render_team);

    Server.get('/:id', render_job);
    Server.get('/:location/:team/:title', render_job);
    Server.get('/apply', render_apply);
    Server.get('/apply/:id', render_apply_job);
    Server.get('/apply/:location/:team/:title', render_apply_job);

    Server.get('/:location/:team', render_team);

    return Server;
}

    jobDAO
        .config({
            jobvite_company_id: 'qgY9Vfw2',
            cache_directory: './data'
        })
        .init(function() {
            jobData = jobDAO.data();
            data_to_template();
        });

exports.addHandlers = addHandlers;
exports.autoUpdate = auto_reload;

