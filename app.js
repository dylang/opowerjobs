
var connect = require('connect'),
    express = require('express'),
    eyes = require('eyes'),
    pages = require('./lib/pages'),
    jobengine = require('./lib/jobs'),

    app = express.createServer(/*connect.logger()*/);

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('partials', __dirname + '/views');
    app.set('reload views', 1000);
    app.set('reload layout', 1000);
});

app.use('/public', connect.staticProvider(__dirname + '/public'));


jobengine.init(function(jobs) {
    load_pages();

    app.helpers({
            pages: pages.page_array,
            eyes: eyes
    });

    app.get('/jobs', function(req, res) { jobengine.jobs(req, res); });
     
    app.get('/jobs/reload', function(req, res) { jobengine.reload(function(count){ res.send('Reload complete. ' + count + ' jobs added.'); }); });

    app.get('/jobs/search/:query/json', function(req, res) { jobengine.search_json(req, res); });
    app.get('/jobs/search/:query', function(req, res) { jobengine.search(req, res); });

    app.get('/jobs/:location/:category/:long_id/:id', function(req, res) { jobengine.job(req, res); });
    app.get('/jobs/apply/:location/:category/:long_id/:id', function(req, res) { jobengine.apply(req, res); });

    app.get('/jobs/:location/:department', function(req, res) { jobengine.job_location_department(req, res); });
    app.get('/jobs/:location', function(req, res, next) { jobengine.job_location(req, res) || next();  } );
    app.get('/jobs/:id', function(req, res) { jobengine.job(req, res); });
 
    listen();
});


function load_pages(){
    pages.page_array.forEach(function(page){
        app.get('/' + page.url, function(req, res, next) { pages.page_handler(req, res, next, page); });
    });
}

function listen() {
    app.listen(3000);
    console.log('\nStarting OPOWER JOBS...\n');
}






