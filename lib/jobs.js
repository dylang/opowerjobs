(function(){
var request = require('request'),
    nStore = require('nstore'),
    jobStore = nStore('data/jobs.db'),
    eyes = require('eyes'),
    pages,
    jobs,

    location_hash = {'arlington': 'DC/Northern Virgina'};

    function location_lookup(location) {
        var lookup = location.toLowerCase();
        return location_hash[lookup] ? location_hash[lookup] : location;
    }


    function load_from_jobvite(callback) {
        var jobvite_xml_listing = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=qgY9Vfw2';


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

                    callback && callback(count);
                });

                x2js.parseString(body);
            }
        });


    }


    function create_job_url(job) {

        var location_url = job.location.toLowerCase().replace(/[^a-z]+/gi, '-');

        var department = job.category;
        var department_url = department.toLocaleLowerCase().replace(/[^a-z]+/gi, '-');

        var title_url = job.title.toLocaleLowerCase().replace(/[^a-z]+/gi, '-');

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


    function init(page_array, callback) {
        pages = page_array;

        jobStore.all(function () {
                return true; // return all;
            }, function(err, data) {
                jobs = format_results(data);
                callback && callback(jobs);
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
            res.render('jobs/jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: search_results, query: query } });

        });

    }

    //app.get('/jobs',
    function jobs(req, res) {
        
        res.render('jobs/jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: jobs, query: '' } });
    }

    //app.get('/jobs/:location',
    function job_location(req, res) {
        var location = req.params.location;
        var local_jobs = { locations: {} };
        local_jobs.locations[location] = jobs.locations[location];
        res.render('jobs/jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: local_jobs, query: '' } });
    }

    //app.get('/jobs/:location/:department'
    function job_location_department(req, res) {
        var location = req.params.location,
            department = req.params.department;

        var dept_jobs = { locations: {} };

        dept_jobs.locations[location] = {};
        dept_jobs.locations[location][department] = jobs.locations[location][department];
        res.render('jobs/jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: dept_jobs, query: '' } });
    }

    //app.get('/jobs/:location/:category/:long_id/:id'
    function job_location_department_long_name_id(req, res) {
        var job_id = req.params.id;

        jobStore.get(job_id, function(err, data) {
            res.render('jobs/job.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: jobs, job: data, query: '' } });
        });
    }

    //app.get('/jobs/:location/:category/:long_id/:id'
    function apply(req, res) {
        var job_id = req.params.id;

        jobStore.get(job_id, function(err, data) {
            res.render('jobs/apply.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: jobs, job: data, query: '' } });
        });
    }


    exports.init = init;
    exports.reload = load_from_jobvite;
    exports.apply = apply;
    exports.search = search;
    exports.search_json = search_json;
    exports.jobs = jobs;
    exports.job_location = job_location;
    exports.job_location_department = job_location_department;
    exports.job_location_department_long_name_id = job_location_department_long_name_id;



})();