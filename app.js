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
    port = parseInt(process.env.PORT || 3000),
    app = express.createServer();
      

function common() {
    app.set('views', viewsDir);
    app.use(assetManager(assets.config));
    app.use(connect.staticProvider(__dirname + '/public'));
}

function production(){
    //app.use(connect.logger());
    app.use(connect.conditionalGet());
    app.use(connect.gzip());
    app.use(connect.errorHandler());
    assets.compress();
}

function development() {
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
}

app.configure(common);

//hack for testing poduction settings 
if (port != 3000) {
    app.configure('production', production);
} else {
    app.configure('development', development);
    app.configure('production', production);
}
app.use(content.createServer( {views: viewsDir, assets: assets }) );
app.use(jobs.createServer( { views: viewsDir, jobvite_company_id: 'qgY9Vfw2', assets: assets }) );
app.get('/:a?/:b?/:c?', function(req, res, next) { log('404'); log(req.url); res.send('404: ' + req.url + ' not found'); next(); });

app.listen(port, null);
log('Starting OPOWER JOBS...');









