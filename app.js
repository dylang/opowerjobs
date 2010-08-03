var connect = require('connect'),
   express = require('express'),
   request = require('request'),
   nStore = require('nstore'),
   jobStore = nStore('data/jobs.db'),
   eyes = require('eyes'),
   pages = require('./pages').pages;


    var app = express.createServer(/*connect.logger()*/);

    app.use('/public', connect.staticProvider(__dirname + '/public'));

    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('reload views', 1000);
        app.set('reload layout', 1000);
    }); 

    function load_from_jobvite(callback) {
        var jobvite_url = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=qgY9Vfw2';

        request({uri:jobvite_url}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var xml2js = require('xml2js');
                var x2js = new xml2js.Parser();
                x2js.addListener('end', function(data) {

                    jobStore.clear();

                    for (var i in data.job) {
                        var job = data.job[i];
                        // Or insert with auto key
                        job.url = create_job_url(job);
                        job.search_string = create_search_string(job);

                        jobStore.save(job.id, job, function (err) {
                            if (err) { throw err; }
                        });



                    }

                    callback && callback();

                });

                x2js.parseString(body);
            }
        });


    }


    function create_job_url(job) {
        var location_hash = {'Arlington': 'DC Northern Virgina'},
            location = job.location.replace(/,.*/, ''),
            location_url = location_hash[location] || location;

        location_url = location_url.toLocaleLowerCase().replace(/[^a-z]+/gi, '-');

        var department = job.category;
        var department_url = department.toLocaleLowerCase().replace(/[^a-z]+/gi, '-');

        var title_url = job.title.toLocaleLowerCase().replace(/[^a-z]+/gi, '-');

        var long_url = [ '/jobs', location_url, department_url, title_url, job.id ].join('/');

        return {location: location_url, department: department_url, title: title_url, long_url: long_url };
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
            locations = {},
            total = 0;

        data.sort(sort_jobs_helper);

        data.forEach(function(job) {
            total++;

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

        console.log('Loaded ' + total + ' jobs.');
        return jobs;
    }


    function load_jobs(callback) {

        jobStore.all(function (doc) {
                return true; // return all;
            }, function(err, data) {
            var jobs = format_results(data);






            app.get('/jobs/search/:query/json', function(req, res) {

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

                    var total_results = Math.min(data.length, 5),
                        results = [];
                    
                    for (var i =0; i < total_results; i++) {
                        var d = data[i];
                        results.push({title: d.title, location: d.location, department: d.url.department, url: d.url.long_url });
                    }

                    results.push({ count: data.length, url: '/jobs/search/' + query });

                    res.send(JSON.stringify(results), { 'Content-Type': 'application/json' });
                });


            });


            app.get('/jobs/search/:query', function(req, res) {

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
                    res.render('jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: search_results, query: query } });

                });

            });


            app.get('/jobs', function(req, res) {
                res.render('jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: jobs, query: '' } });
            });

            app.get('/jobs/:location', function(req, res) {
                var location = req.params.location;
                var local_jobs = { locations: {} };
                local_jobs.locations[location] = jobs.locations[location];
                res.render('jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: local_jobs, query: '' } });
            });

            app.get('/jobs/:location/:department', function(req, res) {
                var location = req.params.location,
                    department = req.params.department;

                var dept_jobs = { locations: {} };

                dept_jobs.locations[location] = {};
                dept_jobs.locations[location][department] = jobs.locations[location][department];
                res.render('jobs.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: dept_jobs, query: '' } });
            });

            app.get('/jobs/:location/:category/:long_id/:id', function(req, res) {
                var job_id = req.params.id;

                jobStore.get(job_id, function(err, data) {
                    res.render('job.ejs', { locals: { pages: pages, eyes: eyes, active: 'opportunities', jobs: jobs, job: data, query: '' } });
                });
            });



            callback && callback();

        });
    }



    function load_pages(){

        pages.forEach(function(page){
            app.get('/' + page.url, function(req, res){
                if (page.url == 'dev') {
                    res.redirect('http://www.heyitsopower.com');
                }
                else {
                    res.render((page.file || page.url) + '.ejs', { locals: { pages: pages, eyes: eyes, active: page.url.search('/') != -1 ? page.url.substr(0, page.url.search('/')) : page.url} });
                }
            });

        });
    }

    function load_server(callback) {
        app.listen(3000);
        console.log('\nStarting OPOWER JOBS...\n');
        callback && callback();
    }

    load_pages();

    //load_from_jobvite(load_jobs(load_server));

    load_jobs(load_server);



