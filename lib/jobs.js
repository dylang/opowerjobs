var log = require('./util/log').from(__filename),
    jobData = require('./jobData'),
    view_dir = 'jobs';


//app.get('/reload'location_hash
function load_from_jobvite(req, res, next) {
    log('load_from_jobvite');
    jobData.update(function() {
         res.render('generic.ejs', { locals: { title: 'Complete', message: 'Done loading jobs.', currentPageID: 'jobs' } });
    });
}

//app.get('/search/:query'
function render_search(req, res, next) {
    var query = req.params.query;
    if (!query) { next(); }
    var jobs = jobData.search(query);
    if (!jobs.length) {
        log('No jobs for search: ' + query);
    }
    res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobs, query: query, currentPageID: 'jobs' } });
}


//app.get('/search/:query/json'
function search_json(req, res) {

    var query = req.params.query;

    var jobs = jobData.search(query),
        total_results = Math.min(jobs.length, 10),
        results = [];

    for (var i = 0; i < total_results; i++) {
        var d = jobs[i];
        results.push({title: d.title, location: d.location, department: d.department, url: d.url.long_url });
    }

    results.push({ count: jobs.length, url: '/search/' + query });
    res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });
}


function render_sf(req, res, next) {
    var jobs = jobData.all_jobs.locations['san-francisco'];
    res.render(view_dir + '/location-sf.ejs', { locals: { jobs: jobs, currentPageID: 'jobs' } });
}

function render_dc(req, res, next) {
    var jobs = jobData.all_jobs.locations['dc-northern-virginia'];
    res.render(view_dir + '/location-dc.ejs', { locals: { jobs: jobs, currentPageID: 'jobs' } });
}


//app.get('/all'
function render_all(req, res, next) {
    res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobData.all_jobs, location: location, department: department, currentPageID: 'jobs' } });
}

//app.get('/:location/:department'
function render_department(req, res, next) {

    var department = req.params.department,
        jobs;

    if (!jobData.all_departments[department]) {
        next();
    }
    else {
        //render just one department
        jobs = { locations: {} };
        jobData.all_jobs.locations.forEach(function(data, location) {
            if (jobData.all_jobs.locations[location][department]) {
                jobs.locations[location] = {};
                jobs.locations[location][department] = jobData.all_jobs.locations[location][department];
            }
        });
        res.render(view_dir + '/department.ejs', { locals: { jobs: jobs, department: department, currentPageID: 'jobs' } });
    }

}

function lookup_job(req) {
    var job,
        long_url = ['', req.params.location, req.params.department, req.params.title].join('/').toLowerCase().replace(/\/+$/, '');

    if (jobData.all_urls[long_url]) {
        job =jobData.all_ids[ jobData.all_urls[long_url] ];
    }

    if (!job) {
        job = jobData.all_ids[ req.params.location ];
    }

    if (!job) {
        log('job lookup failed: ' + long_url);
    }
    return job;
}

//app.get('/:location/:department/:title'
function render_job(req, res, next) {
    var job = lookup_job(req);
    if (job) {
        res.render(view_dir + '/job.ejs', { locals: { job: job, currentPageID: 'jobs' } });
    } else {
        next();
    }
}

//app.get('/:location/:department/:title'
function render_apply(req, res, next) {
    var job = lookup_job(req);

    if (job) {
        res.render(view_dir + '/apply.ejs', { locals: { job: job, currentPageID: 'jobs' } });
    } else {
        next();
    }



}

function render_departments(req, res) {
    res.render(view_dir + '/departments.ejs', { locals: { currentPageID: 'jobs' } } );
}

function createServer(options) {

    var Server = options.Server;

    Server.helpers({
        jobs: jobData.all_jobs,
        all_locations: jobData.all_locations,
        all_departments: jobData.all_departments,
        all_ids: jobData.all_ids
    });

    Server.get('/reload', load_from_jobvite);
    Server.get('/all', render_all);

    Server.get('/search/:query/json', search_json);
    Server.get('/search/:query', render_search);

    Server.get('/departments', render_departments);
    Server.get('/san-francisco', render_sf);
    Server.get('/dc-northern-virginia', render_dc);
    Server.get('/:department', render_department);

    Server.get('/:location?/:department?/:title?', render_job);
    Server.get('/apply/:location/:department/:title', render_apply);

    Server.get('/:location/:department', render_department);
    Server.get('/:id', render_job);
    Server.get('/*', function(req,res,next) {log('not jobs'); next();});

    //Run an update
    //jobData.update();

    log('ready.');
    return Server;
}

exports.createServer = createServer;


