var connect = require('connect'),
    express = require('express'),
    request = require('request'),
    cache = require('./util/cache'),
    log = require('./util/log').from(__filename),
    jsonToHTML = require('./util/prettyJSON'),
    pages = require('./pages').page_array,
    jobData = require('./jobData'),

    view_dir = 'jobs',
    location_hash = {'arlington': 'DC/Northern Virgina'};


//app.get('/jobs/reload'
function load_from_jobvite(req, res, next) {
    log('load_from_jobvite');

    cache.update(jobvite_xml_listing + jobvite_company_id, 'jobs', function() {
        res.send('complete');
    });
}

//app.get('/jobs/search/:query'
function render_search(req, res, next) {
    var query = req.params.query;
    if (!query) { next(); }
    var jobs = jobData.search(query);
    if (!jobs.length) {
        log('No jobs for search: ' + query);
    }
    res.render(view_dir + '/index.ejs', { locals: { jobs: jobs, query: query } });
}


//app.get('/jobs/search/:query/json'
function search_json(req, res) {

    var query = req.params.query;

    var jobs = jobData.search(query),
        total_results = Math.min(jobs.length, 10),
        results = [];

    for (var i = 0; i < total_results; i++) {
        var d = jobs[i];
        results.push({title: d.title, location: d.location, department: d.department, url: d.url.long_url });
    }

    results.push({ count: jobs.length, url: '/jobs/search/' + query });
    res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });



}



//app.get('/jobs/:location/:department'
function render_list(req, res) {
    var location = req.params.location,
        department = req.params.department,
        jobs;

    if (!location && !location) {
        jobs = jobData.all_jobs;
    }
    else {
        jobs = { locations: {} };
        if (location && jobData.all_jobs.locations[location]) {

            if (department && jobData.all_jobs.locations[location][department]) {
                jobs.locations[location] = {};
                jobs.locations[location][department] = jobData.all_jobs.locations[location][department];
            }
            else  {
                jobs.locations[location] = jobData.all_jobs.locations[location];
            }
        } else {
            jobData.all_jobs.locations.forEach(function(data, location) {
                if (jobData.all_jobs.locations[location][department]) {
                    jobs.locations[location] = {};
                    jobs.locations[location][department] = jobData.all_jobs.locations[location][department];
                }
            });

        }
    }
    res.render(view_dir + '/index.ejs', { locals: { jobs: jobs, location: location, department: department } });
}

function lookup_job(req) {
    var job,
        long_url = ['/jobs', req.params.location, req.params.department, req.params.title].join('/').toLowerCase().replace(/\/+$/, '');

    if (jobData.all_urls[long_url]) {
        job =jobData.all_ids[ jobData.all_urls[long_url] ];
    }

    if (!job) {
        job = jobData.all_ids[ req.params.location ];
    }

    return job;
}

//app.get('/jobs/:location/:department/:title'
function render_job(req, res, next) {
    var job = lookup_job(req);
    if (job) {
        res.render(view_dir + '/job.ejs', { locals: { job: job } });
    } else {
        next();
    }
}

//app.get('/jobs/:location/:department/:title'
function render_apply(req, res, next) {
    var job = lookup_job(req);

    if (job) {
        res.render(view_dir + '/apply.ejs', { locals: { job: job } });
    } else {
        next();
    }



}

function render_departments(req, res) {
    res.render(view_dir + '/index.ejs', { locals: { departments: true } });
}


function createServer(options) {

    if (options.jobvite_company_id) {
        jobvite_company_id = options.jobvite_company_id;
    }

    var app = express.createServer(/* connect.logger() */);

    app.configure(function(){
        app.set('views', options.views);
        app.set('reload views', 1000);
    });

    app.helpers({
        pages: pages,
        log: log,
        urlize: jobData.urlize,
        debug: jsonToHTML,
        active: 'jobs',
        jobs: jobData.all_jobs,
        all_locations: jobData.all_locations,
        all_departments: jobData.all_departments,
        all_ids: jobData.all_ids
    });

    app.get('/', render_list);

    app.get('/reload', load_from_jobvite);

    app.get('/search/:query/json', search_json);
    app.get('/search/:query', render_search);

    app.get('/:location?/:department?/:title?', render_job);
    app.get('/apply/:location/:department/:title', render_apply);

    app.get('/:location/:department', render_list);
    app.get('/:location', render_list );
    app.get('/:id', render_job);

    app.get('/departments/:department', render_list);
    app.get('/departments', render_departments);

    app.get('/:a?/:b?/:c?/:d?', function(req, res) { log('Redirect from ' + req.url); res.redirect('home'); });


    log('ready.');
    return app;
}

exports.createServer = createServer;


