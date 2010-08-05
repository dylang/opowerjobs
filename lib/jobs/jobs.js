(function(){
var connect = require('connect'),
    express = require('../../deps/express/index'),
    request = require('request'),
    nStore = require('nstore'),
    jobStore = nStore('./data/jobs.db'),
    log = require('../util/log').from(__filename),
    pages = require('../pages').page_array,
    jobs,
    view_dir = 'jobs',
    location_hash = {'arlington': 'DC/Northern Virgina'},
    jobvite_xml_listing = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=', //qgY9Vfw2
    jobvite_company_id = 'qgY9Vfw2';

    function location_lookup(location) {
        var lookup = location.toLowerCase();
        return location_hash[lookup] ? location_hash[lookup] : location;
    }


    /* make almost any string good for a url path */

    function urlize(s) {
        return s.toLocaleLowerCase().replace(/[^a-z]+/gi, '-');
    }
    function create_job_url(job) {
        var location_url = job.location.toLowerCase().replace(/[^a-z]+/gi, '-');

        var department = job.category;
        var department_url = urlize(department);

        var title_url = urlize(job.title);

        var long_url = [ '/jobs', location_url, department_url, title_url, job.id ].join('/');
        var apply_url = [ '/jobs/apply', location_url, department_url, title_url, job.id ].join('/');
        return {location: location_url, department: department_url, title: title_url, long_url: long_url, apply: apply_url };
    }


    function remove_html(string) {
        return string.replace(/<[^>]*>/g, ' ')
                .replace(/&nbsp;/g, ' ');
    }

    function create_search_string(job) {
        return remove_html([job.title, job.location, job.url.location, job.url.department, job.category, job.description]
                .join(' ')
                .toLocaleLowerCase());
    }


    var sort_jobs_helper = function(a, b) {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
    };


    function format_results(data) {
        var jobs = { },
            locations = {};

        data.sort(sort_jobs_helper);

        data.forEach(function(job) {

            var urls = create_job_url(job);


            var location = urls.location;
            locations[location] = locations[location] || {};


            var category = urls.department;
            locations[location][category] = locations[location][category] || [];
            locations[location][category].push(job);


            job.opower_url = 'http://www.opower.com/Careers/CurrentOpportunities.aspx?nl=1&jvi=' + job.id + ',Job&jvk=Job';
            job.url = urls.long_url;

        });

        jobs.locations = locations;

        return jobs;
    }

    function init(callback) {

        jobStore.all(function () {
                return true; // return all;
            }, function(err, data) {
                jobs = format_results(data);
                callback && callback(jobs);
        });
    }

    //app.get('/jobs/reload'
    function load_from_jobvite(req, res, next) {
        log('load_from_jobvite');

        request({uri:jobvite_xml_listing}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var xml2js = require('xml2js');
                var x2js = new xml2js.Parser();
                x2js.addListener('end', function(data) {

                    jobStore.clear();
                    var count = 0;

                    for (var i in data.job) {
                        count++;
                        var job = data.job[i];

                        job.location = location_lookup(job.location.replace(/,.*/, ''));
                        job.url = create_job_url(job);
                        job.search_string = create_search_string(job);

                        jobStore.save(job.id, job, function (err) {
                            if (err) { throw err; }
                        });
                    }
                    res.send('Reload complete. ' + count + ' jobs added.');
                });

                x2js.parseString(body);
            }
        });
    }

    //app.get('/jobs/search/:query/json'
    function search_json(req, res) {

        var query = req.params.query;

        jobStore.all(function (doc) {
            if (!doc.search_string) {
                return false;
            }

            var search_array = query.toLowerCase().split(/[\s|\+]/);
            for (var i = 0, l = search_array.length; i < l; i++) {
                var search_for = search_array[i];
                if (doc.search_string.search(search_for) === -1) {
                    return false;
                }
            }

            return true;

        }, function(err, data) {

            data.sort(sort_jobs_helper);

            var total_results = Math.min(data.length, 10),
                results = [];

            for (var i =0; i < total_results; i++) {
                var d = data[i];
                results.push({title: d.title, location: d.location, department: d.url.department, url: d.url.long_url });
            }

            results.push({ count: data.length, url: '/jobs/search/' + query });

            res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });
        });

    }

    //app.get('/jobs/search/:query'
    function search(req, res) {
        var query = remove_html(req.params.query).replace(/[^a-zA-Z]/g, ' ').replace(/\s\s/g, ' ') || false;

        jobStore.all(function (doc) {
                if (!doc.search_string) {
                    return false;
                }

                var search_array = query.toLowerCase().split(/[\s|\+]/);
                for (var i = 0, l = search_array.length; i < l; i++) {
                    var search_for = search_array[i];
                    if (doc.search_string.search(search_for) === -1) {
                        return false;
                    }
                }

                return true;

            }, function(err, data) {
            if (err) { throw err; }
            var search_results = format_results(data);
            res.render(view_dir + '/jobs.ejs', { locals: { jobs: search_results, query: query } });

        });

    }

    //app.get('/jobs',
    function jobs_index(req, res, next) {
        res.render(view_dir + '/index.ejs', { locals: {  } } );
    }

    //app.get('/jobs/:location',
    function job_location(req, res, next) {
        var location = req.params.location;
        if (jobs.locations[location]) {
            var local_jobs = { locations: {} };
            local_jobs.locations[location] = jobs.locations[location];
            res.render(view_dir + '/jobs.ejs', { locals: { jobs: local_jobs } });
        }
        else {
            next();
        }
    }

    //app.get('/jobs/:location/:department'
    function job_location_department(req, res) {
        var location = req.params.location,
            department = req.params.department;

        var dept_jobs = { locations: {} };

        dept_jobs.locations[location] = {};
        dept_jobs.locations[location][department] = jobs.locations[location][department];
        res.render(view_dir + '/jobs.ejs', { locals: { jobs: dept_jobs } });
    }

    //app.get('/jobs/:location/:category/:long_id/:id'
    function job(req, res, next) {
        var job_id = req.params.id;

        jobStore.get(job_id, function(err, data) {
            if (err) {
                next();
            }
            else {
                res.render(view_dir + '/job.ejs', { locals: { job: data } });
            }
        });
    }

    //app.get('/jobs/:location/:category/:long_id/:id'
    function apply(req, res) {
        var job_id = req.params.id;

        jobStore.get(job_id, function(err, data) {
            res.render(view_dir + '/apply.ejs', { locals: { job: data } });
        });
    }

    function departments(req, res) {

        res.render(view_dir + '/jobs.ejs', { locals: { departments: true } });

    }

    function createServer(options) {

        if (options.jobvite_company_id) {
            jobvite_company_id = options.jobvite_company_id;
        }

        var app = express.createServer(/* connect.logger() */);


        //app.use(connect.errorHandler({ showStack: true, dumpExceptions: true }));
        app.error(function(err, req, res){
            log('ERROR: ' + req.url);
            log(err);
        });

        app.configure(function(){
            app.set('views', options.views);
            app.set('reload views', 1000);
        });

        init(function() {

            app.helpers({
                pages: pages,
                log: log,
                urlize: urlize,
                active: 'jobs',
                jobs: jobs
            });
            
            app.get('/', jobs_index);

            app.get('/reload', load_from_jobvite);

            app.get('/search/:query/json', search_json);
            app.get('/search/:query', search);

            app.get('/:location/:category/:long_id/:id', job);
            app.get('/apply/:location/:category/:long_id/:id', apply);

            app.get('/:location/:department', job_location_department);
            app.get('/:location', job_location );
            app.get('/:id', job);

            app.get('/departments', departments);

            app.get('/:a?/:b?/:c?/:d?', function(req, res) { log('Redirect from ' + req.url); res.redirect('home'); });


            log('ready.');
        });

        return app;
    }

    exports.createServer = createServer;


})();