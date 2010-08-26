var log = require('./util/log').from(__filename),
    jobData = require('./jobData'),
    view_dir = 'jobs';

//app.get('/reload'location_hash
function load_from_jobvite(req, res, next) {
    log('load_from_jobvite');
    jobData.update(function() {
         res.render('error.ejs', { locals: { title: 'Complete', message: 'Done loading jobs.', currentPageID: 'jobs' } });
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
    res.render(view_dir + '/search.ejs', { locals: { jobs: jobs, query: query, currentPageID: 'jobs' } });
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
    var jobs = jobData.all_jobs['san-francisco'];
    res.render(view_dir + '/locations/sf.ejs', { locals: { jobs: jobs, currentPageID: 'jobs' } });
}

function render_dc(req, res, next) {
    var jobs = jobData.all_jobs['dc-northern-virginia'];
    res.render(view_dir + '/locations/dc.ejs', { locals: { jobs: jobs, currentPageID: 'jobs' } });
}

//app.get('/all'
function render_all(req, res, next) {
    res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobData.all_jobs, currentPageID: 'jobs' } });
}

//app.get('/:location/:department'
function render_department(req, res, next) {
    var department = req.params.department,
        location = req.params.location;

    if (location && !jobData.all_locations[location] && jobData.all_departments[department]) {
        res.redirect('/' + department);
    }

    if (!jobData.all_departments[department]) {
        next();
    }
    else {
        log('dept 2');

        //render just one department
        var jobs_sf = jobData.all_jobs['san-francisco'][department],
            jobs_dc = jobData.all_jobs['dc-northern-virginia'][department];

        var dept_file = department;
        res.render(view_dir + '/department.ejs', { locals: { header: dept_file, jobs_sf: jobs_sf, jobs_dc: jobs_dc, department: department, currentPageID: 'jobs' } });
    }

}

function lookup_longurl(req) {
    var job,
        long_url = ['', req.params.location, req.params.department, req.params.title].join('/').toLowerCase().replace(/\/+$/, '');

    if (jobData.all_urls[long_url]) {
        job =jobData.all_ids[ jobData.all_urls[long_url] ];
    }

    if (!job) {
        //log('no job with id: ' + long_url + ' or ' + req.params.id);
    }
    return job;
}

function lookup_id(req) {
    var job= jobData.all_ids[ req.params.id ];
    return job;
}


//app.get('/:location/:department/:title'
function render_job(req, res, next) {
    var job = lookup_id(req);

    if (job){
        res.send('redirect to' + job.url.long_url);
        res.redirect(job.url.long_url);
    }
    else
    {
        job = lookup_longurl(req);
        if (job) {
            res.render(view_dir + '/job.ejs', { locals: { job: job, currentPageID: 'jobs' } });
        } else {
            next();
        }
    }
}

//app.get('/:location/:department/:title'
function render_apply(req, res, next) {
    var job = lookup_longurl(req);
    if (job) {
        res.render(view_dir + '/jobvite-apply.ejs', { locals: { job: job, currentPageID: 'jobs' } });
    } else {
        next();
    }



}

function render_departments(req, res) {
    res.render(view_dir + '/departments.ejs', { locals: { currentPageID: 'jobs' } } );
}

function addHandlers(options) {

    var Server = options.Server;

    Server.helpers({
        jobs: jobData.all_jobs,
        all_locations: jobData.all_locations,
        all_departments: jobData.all_departments,
        all_ids: jobData.all_ids,
        all_critical: jobData.all_critical,
        all_new: jobData.all_new
    });

    Server.get('/reload', load_from_jobvite);
    Server.get('/all', render_all);

    Server.get('/search/:query/json', search_json);
    Server.get('/search/:query', render_search);

    Server.get('/departments', render_departments);
    Server.get('/san-francisco', render_sf);
    Server.get('/dc-northern-virginia', render_dc);

    Server.get('/:department', render_department);

    Server.get('/:id', render_job);
    Server.get('/:location/:department/:title', render_job);
    Server.get('/apply/:location/:department/:title', render_apply);

    Server.get('/:location/:department', render_department);
    Server.get('/*', function(req,res,next) {next();});

    //Run an update
    //jobData.update();

    log('ready.');
    return Server;
}

exports.addHandlers = addHandlers;
exports.autoUpdate = jobData.autoUpdate;

