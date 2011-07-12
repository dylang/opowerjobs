/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename),
    Jobvite = require('jobvite'),
    jobDAO = require('./jobs/dao'),
    Constants = require('./jobs/constants'),
    Util = require('./jobs/util'),
    team_pages = require('./jobs/team_pages'),
    ReferralHandler = require('./referralHandler'),
    Server;

//<%= locals.job ? '- ' + locals.job.title + ' (' + Constants.short(locals.job.location) + ')' : '' %><%= locals.location ? Constants.long(locals.location) : '' %><%= locals.team && locals.all_teams[locals.team]  ? '- ' +  locals.all_teams[locals.team] : '' %>

//app.get('/search/:query'
function render_search(req, res, next) {
    var query = Util.unurl(req.params.query);
    if (!query) { next(); }

    var jobs = jobDAO.search(query);
    if (!jobs.length) {
        log('No jobs for search: ' + query);
    }
    res.render('search/search.ejs', {
        jobs: jobs,
        query: query,
        title: 'Search for ' + query,
        currentPageID: 'jobs'
    });
}


//app.get('/search/:query/json'
function search_json(req, res) {

    var query = req.params.query;

    var jobs = jobDAO.search(query),
        total_results = Math.min(jobs.length, 10),
        results = [];

    for (var i = 0; i < total_results; i++) {
        var d = jobs[i];
        results.push({title: d.title, location: d.location_id, url: d.urls.full_url });
    }

    results.push({ count: jobs.length, url: '/search/' + query });
    res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });
}


function render_sf(req, res, next) {
    var collection = jobDAO.location(Constants.LOCATIONS.sf.id);
    res.render('locations/sf.ejs', {
        collection: collection,
        title: Constants.LOCATIONS.sf.name,
        currentPageID: 'jobs'
    });
}

function render_dc(req, res, next) {
    var collection = jobDAO.location(Constants.LOCATIONS.va.id);
    res.render('locations/dc.ejs',{
        collection: collection,
        title: Constants.LOCATIONS.va.name,
        currentPageID: 'jobs'
    });

}

function render_team(req, res, next) {
    var team_id = req.params.team_id,
        location_id = req.params.location_id;

    if (location_id && jobDAO.team(team_id)) {
        res.redirect('/' + team_id);
    }
    else if (!jobDAO.team(team_id)) {
        next();
    } else {
        var collection = jobDAO.team_jobs(team_id);
        var team_page = team_pages[team_id] || 'generic-team-page';

        res.render('teams/team.ejs', {
            title:          jobDAO.team(team_id).name,
            team_page:      team_page,
            collection:     collection,
            team_id:        team_id,
            currentPageID:  team_id == 'engineering' ? 'engineering' : 'teams'
        });
    }
}

function render_teams(req, res) {
    var collection = jobDAO.teams();
    res.render('teams/teams.ejs', {
        title: 'Teams',
        collection: collection,
        currentPageID: 'teams'
    });
}

function all_reqs(req, res) {
    var collection = jobDAO.newest();
    res.render('job-pages/all-reqs.ejs', {
        title: 'All Reqs',
        collection: collection,
        currentPageID: 'jobs'
    });

}

function render_job(req, res, next) {
    var job = jobDAO.job(req.params.job_id);
    if (job) {
        res.redirect(job.urls.full_url);
    }
    else {
        var url = ['', req.params.location_id, req.params.team_id, req.params.title_id].join('/').toLowerCase().replace(/\/+$/, '');
        job = jobDAO.job(url);

        if (job) {
            res.render('job-pages/job.ejs', {
                job: job,
                title: job.title,
                currentPageID: 'jobs'
            });
        } else {
            next();
        }
    }
}

function render_apply(req, res, next) {
    res.render('job-pages/jobvite-apply.ejs', {
        title: 'Apply',
        referral: ReferralHandler.generateString(req.session)
    });
}

function render_apply_job(req, res, next) {
    var job = jobDAO.job(req.params.job_id);
    if (job) {
        res.redirect('/apply' + job.urls.full_url);
    }
    else
    {
        var url = ['', req.params.location_id, req.params.team_id, req.params.title_id].join('/').toLowerCase().replace(/\/+$/, '');
        job = jobDAO.job(url);

        if (job) {
            res.render('job-pages/jobvite-apply.ejs', {
                job:        job,
                title:      'Apply - ' + job.title,
                referral:   ReferralHandler.generateString(req.session, job)
            });
        } else {
            next();
        }
    }
}


function render_feedburner(req, res, next) {
    /* FeedBurner|FeedValidator is hosting it, but when they request the feed they will get the real feed. */
 if ((req.header('user-agent','').match(/FeedBurner|FeedValidator/i) === null) && req.header('host', '').split(':')[0] != 'localhost') {
     res.redirect('http://feeds.feedburner.com/opowerjobs');
    } else {
        next();
    }
}

function render_feed(req, res, next) {
    res.contentType('atom.xml');
    res.render('job-pages/atom.ejs', {
        layout: false,
        jobs: jobDAO.newest(),
        url: 'http://opowerjobs.com'
    } );
}

function render_json(req, res, next) {
    res.send(JSON.stringify(jobDAO.newest()), { 'Content-Type': 'application/json' });

}

function resize_iframe(req, res) {
    res.render('job-pages/jobvite-resize-iframe.ejs', {
        layout: false
    });
}

function reload(req, res, next) {
    log('reload');
    jobDAO.reload(function(data, changes) {
        res.render('reload.ejs', {
            title: 'Complete',
            message: 'Done loading jobs.',
            changes: changes,
            currentPageID: 'jobs'
        });
    });
}

function addHandlers(options) {
    Server = options.Server;
    Server.get('/resize-iframe.html', resize_iframe);
    Server.get('/reload', reload);
    Server.get('/atom.xml', render_feedburner);
    Server.get(/debug.xml$/, render_feed);
    Server.get('/jobs.json', render_json);

    Server.get('/search/:query/json', search_json);
    Server.get('/search/:query', render_search);

    Server.get('/teams', render_teams);
    Server.get('/san-francisco', render_sf);
    Server.get('/dc-northern-virginia', render_dc);

    Server.get('/:team_id', render_team);

    Server.get('/:job_id', render_job);
    Server.get('/:location_id/:team_id/:title_id', render_job);
    Server.get('/apply', render_apply);
    Server.get('/apply/:job_id', render_apply_job);
    Server.get('/apply/:location_id/:team_id/:title_id', render_apply_job);

    Server.get('/:location/:team', render_team);

    Server.get('/all-reqs', all_reqs)

    Server.locals({
        Constants: Constants
    });

    jobDAO.init({ auto_update: Server.set('env') == 'production'}, function() {
        log('jobs ready');
    });

    return Server;
}


exports.addHandlers = addHandlers;