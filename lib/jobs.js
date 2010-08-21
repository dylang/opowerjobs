var Connect = require('connect'),
    Express = require('express'),
    log = require('./util/log').from(__filename),
    objToHTML = require('./util/prettyJSON'),
    pages = require('./pages').tree,
    jobData = require('./jobData'),
    view_dir = 'jobs';


//app.get('/reload'location_hash
function load_from_jobvite(req, res, next) {
    log('load_from_jobvite');
    jobData.update(function() {
         res.render('generic.ejs', { locals: { title: 'Complete', message: 'Done loading jobs.' } });
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
    res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobs, query: query } });
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
    res.render(view_dir + '/location-sf.ejs', { locals: { jobs: jobs } });
}

function render_dc(req, res, next) {
    var jobs = jobData.all_jobs.locations['dc-northern-virginia'];
    res.render(view_dir + '/location-dc.ejs', { locals: { jobs: jobs } });
}


//app.get('/:location/:department'
function render_list(req, res, next) {
    var location = req.params.location,
        department = req.params.department,
        location_or_department = req.params.location_or_department,
        jobs;
    
    if (location_or_department) {
        if (jobData.all_locations[location_or_department]) {
            location = location_or_department;
        } else
        if (jobData.all_departments[location_or_department]) {
            department = location_or_department;
        } else {
            next();
        }
    } else {
        location = jobData.all_locations[location] ? location : false;
        department = jobData.all_departments[department] ? department : false;
    }

    if (!location && !department) {
        jobs = jobData.all_jobs;
        res.render(view_dir + '/all-jobs.ejs', { locals: { jobs: jobs, location: location, department: department } });
    }
    else {
        jobs = { locations: {} };
        jobData.all_jobs.locations.forEach(function(data, location) {
            if (jobData.all_jobs.locations[location][department]) {
                jobs.locations[location] = {};
                jobs.locations[location][department] = jobData.all_jobs.locations[location][department];
            }
        });
        //render just one department
        res.render(view_dir + '/department.ejs', { locals: { jobs: jobs, department: department, currentPageID: 'departments' } });
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
        var j1 = job.description.split(/(Job Description)|(About the Role)|(ABOUT THE JOB)|(Responsibilities)|(REQUIREMENTS)|(About You)/i);
        var j2 = [];
        var d = [];

        j1.forEach(function(section) {
            if (section) { j2.push(section); }
        });

        j2 = j2.map(function(section) {
            return section
                .replace(/^<br \/>/, '')
                .replace(/<br \/>$/, '')
                .trim();
        });

        var i, l;
        
        for (i=0, l=j2.length; i<l; i++) {
            if (j2[i].length) {
            d.push({title: j2[i], p: j2[i+1] });
            i++;
            }
        }
        res.render(view_dir + '/job.ejs', { locals: { job: job, desc: d } });
    } else {
        next();
    }
}

//app.get('/:location/:department/:title'
function render_apply(req, res, next) {
    var job = lookup_job(req);

    if (job) {
        res.render(view_dir + '/apply.ejs', { locals: { job: job } });
    } else {
        next();
    }



}

function render_departments(req, res) {
    log('render deps damnit');
    res.render(view_dir + '/departments.ejs', { locals: { currentPageID: 'departments' } } );
}


function createServer(options) {

    if (options.jobvite_company_id) {
        jobvite_company_id = options.jobvite_company_id;
    }

    var Server = Express.createServer(/* connect.logger() */);

    Server.configure(function(){
        Server.set('views', options.views);
        Server.set('reload views', 1000);
        //Server.use(Server.router);
    });

    Server.helpers({
        pages: pages,
        log: log,
        urlize: jobData.urlize,
        jobs: jobData.all_jobs,
        all_locations: jobData.all_locations,
        all_departments: jobData.all_departments,
        all_ids: jobData.all_ids,
        assets: options.assets,
        currentPageID: 'allJobs'
    });

    //Server.get('/', render_list);

    Server.get('/reload', load_from_jobvite);

    Server.get('/search/:query/json', search_json);
    Server.get('/search/:query', render_search);

    Server.get('/departments', render_departments);
    Server.get('/san-francisco', render_sf);
    Server.get('/dc-northern-virginia', render_dc);
    Server.get('/:location_or_department', render_list);

    Server.get('/:location?/:department?/:title?', render_job);
    Server.get('/apply/:location/:department/:title', render_apply);

    Server.get('/:location/:department', render_list);
    Server.get('/:id', render_job);
    Server.get('/*', function(req,res,next) {log('not jobs'); next();});


    //Run an update
    jobData.update();

    log('ready.');
    return Server;
}

exports.createServer = createServer;


