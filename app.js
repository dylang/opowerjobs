require.paths.unshift("./deps");

require('proto');

var log = require('./lib/util/log').from(__filename),
    connect = require('connect'),
    express = require('express'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    assets = require('./lib/assets'),

    content = require('./lib/content'),
    jobs = require('./lib/jobs'),

    viewsDir = __dirname + '/views',
    app = express.createServer();
      

app.configure(function(){
    app.set('views', viewsDir);
    app.use(assetManager(assets.config));
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    //app.use(connect.logger());
    app.use(connect.conditionalGet());
    app.use(connect.gzip());
    app.use(connect.errorHandler());
    assets.compress();
});

app.use(content.createServer( {views: viewsDir, assets: assets }) );
app.use(jobs.createServer( { views: viewsDir, jobvite_company_id: 'qgY9Vfw2', assets: assets }) );
app.get('/:a?/:b?/:c?', function(req, res, next) { log('404'); log(req.url); res.send('404: ' + req.url + ' not found'); next(); });

app.listen(parseInt(process.env.PORT || 3000), null);
log('Starting OPOWER JOBS...');









