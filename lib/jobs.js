/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename),
    jobDAO = require('./jobData'),
    jobData = jobDAO.data();


var view_dir = 'jobs',
    PAGE_ID = 'jobs',
    MINUTES_UNTIL_NEXT_UPDATE = 5; /* every 5 minutes */ // 60;  /* every hour */


//app.get('/reload' 
function reload_from_jobvite(req, res, next) {
    jobDAO.reload(function() {
         res.render('error.ejs', { locals: { title: 'Complete', message: 'Done loading jobs.', currentPageID: 'jobs' } });
        jobData = jobDAO.data();
    }, true);
}

function auto_reload() {
    jobDAO.reload(function(data){
        jobData = jobDAO.data();
        log(data ? 'update successful' : 'update failed');
        log('next update in', MINUTES_UNTIL_NEXT_UPDATE, 'minutes');
        setTimeout(auto_reload, MINUTES_UNTIL_NEXT_UPDATE * 60000);
    });
}

//app.get('/search/:query'
function render_search(req, res, next) {
    var query = req.params.query;
    if (!query) { next(); }
    var jobs = jobDAO.search(query);
    if (!jobs.length) {
        log('No jobs for search: ' + query);
    }
    res.render(view_dir + '/search.ejs', { locals: { jobs: jobs, query: query, search_log: jobData.search_log, currentPageID: PAGE_ID } });
}


//app.get('/search/:query/json'
function search_json(req, res) {

    var query = req.params.query;

    var jobs = jobDAO.search(query),
        total_results = Math.min(jobs.length, 10),
        results = [];

    for (var i = 0; i < total_results; i++) {
        var d = jobs[i];
        results.push({title: d.title, location: d.location, team: d.team, url: d.url.long_url });
    }

    results.push({ count: jobs.length, url: '/search/' + query });
    res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });
}


function render_sf(req, res, next) {
    var jobs = jobData.all_jobs['san-francisco'];
    res.render(view_dir + '/locations/sf.ejs', { locals: { jobs: jobs, currentPageID: PAGE_ID } });
}

function render_dc(req, res, next) {
    var jobs = jobData.all_jobs['dc-northern-virginia'];
    res.render(view_dir + '/locations/dc.ejs', { locals: { jobs: jobs, currentPageID: PAGE_ID } });
}

//app.get('/all'
function render_all(req, res, next) {
    res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobData.all_jobs, currentPageID: 'all' } });
}
//app.get('/new'
function render_new(req, res, next) {
    res.render(view_dir + '/new.ejs', { locals: { currentPageID: PAGE_ID } });
}

//app.get('/hot'
function render_hot(req, res, next) {
    res.render(view_dir + '/hot.ejs', { locals: { currentPageID: PAGE_ID } });
}


//app.get('/:location/:team'
function render_team(req, res, next) {
    var team = req.params.team,
        location = req.params.location;

    if (location && !jobData.all_locations[location] && jobData.all_teams[team]) {
        res.redirect('/' + team);
    }

    if (!jobData.all_teams[team]) {
        next();
    }
    else {
        //render just one team
        var jobs_sf = jobData.all_jobs['san-francisco'][team],
            jobs_dc = jobData.all_jobs['dc-northern-virginia'][team];

        var team_page = jobData.team_pages[team] || 'generic-team-page';
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
    if (req.params.id){
        job = jobData.all_ids[ req.params.id ] || jobData.all_ids[ jobData.all_urls['/' + req.params.id ] ];
    }
    return job;
}


//app.get('/:location/:team/:title'
function render_job(req, res, next) {
    var job = lookup_id(req);

    if (job) {
        log('redirect to' + job.url.long_url);
        res.redirect(job.url.long_url);
    }
    else
    {
        job = lookup_longurl(req);
        if (job) {
            res.render(view_dir + '/job.ejs', { locals: { job: job, currentPageID: PAGE_ID } });
        } else {
            next();
        }
    }
}

//app.get('/:location/:team/:title'
function render_apply(req, res, next) {
    var job = lookup_longurl(req);
    if (job) {
        res.render(view_dir + '/jobvite-apply.ejs', { locals: { job: job, currentPageID: PAGE_ID } });
    } else {
        next();
    }



}

function render_teams(req, res) {
    res.render(view_dir + '/teams.ejs', { locals: { currentPageID: 'teams' } } );
}

function render_feed(req, res, next) {
    function ISODateString(d) {
        this.counter = this.counter || 0;
        this.counter++;
        function pad(n) { return n<10 ? '0'+n : n; }
         return d.getUTCFullYear()+'-'
              + pad(d.getUTCMonth()+1)+'-'
              + pad(d.getUTCDate())+'T'
              + pad(d.getUTCHours())+':'
              + pad(Math.floor(this.counter/60))+':'
              + pad(60 % ++this.counter)+'Z'
    }

    res.contentType('atom.xml');
    res.render(view_dir + '/atom.ejs', {
        layout: false,
        locals: {
            update: ISODateString(new Date()),
            url: 'http://www.opowerjobs.com',
            ISODateString: ISODateString
        }
    } );
}


function addHandlers(options) {
    var Server = options.Server;

    Server.helpers({
        jobs: jobData.all_jobs,
        all_locations: jobData.all_locations,
        all_teams: jobData.all_teams,
        all_ids: jobData.all_ids,
        all_critical: jobData.all_critical,
        all_new: jobData.all_new
    });

    Server.get('/reload', reload_from_jobvite);
    Server.get('/jobs', render_all);
    Server.get('/all', render_all);
    Server.get('/new', render_new);
    Server.get('/hot', render_hot);
    Server.get('/atom.xml', render_feed);

    Server.get('/search/:query/json', search_json);
    Server.get('/search/:query', render_search);

    Server.get('/teams', render_teams);
    Server.get('/san-francisco', render_sf);
    Server.get('/dc-northern-virginia', render_dc);

    Server.get('/:team', render_team);

    Server.get('/:id', render_job);
    Server.get('/:location/:team/:title', render_job);
    Server.get('/apply/:location/:team/:title', render_apply);

    Server.get('/:location/:team', render_team);
    Server.get('/*', function(req,res,next) {next();});

    //Run an update
    //jobData.update();

    log('ready.');
    return Server;
}

exports.addHandlers = addHandlers;
exports.autoUpdate = auto_reload;

