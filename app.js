require.paths.unshift("./deps");

require('proto');

var log = require('./lib/util/log').from(__filename),
    Connect = require('connect'),
    Express = require('express'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    assets = require('./lib/assets'),

    Content = require('./lib/content'),
    Jobs = require('./lib/jobs'),

    viewsDir = __dirname + '/views',
    port = parseInt(process.env.PORT || 3000),
    Server = Express.createServer();


function common() {
    Server.set('views', viewsDir);
    Server.use(assetManager(assets.config));
    Server.use(Connect.staticProvider(__dirname + '/public'));
}

function production(){
    //app.use(Connect.logger());
    Server.use(Connect.conditionalGet());
    Server.use(Connect.gzip());
    Server.use(Connect.errorHandler());
    assets.compress();
}

function development() {
    Server.use(Connect.errorHandler({ dumpExceptions: true, showStack: true }));
}

Server.configure(common);

//hack for testing poduction settings
if (port != 3000) {
    Server.configure('production', production);
} else {
    Server.configure('development', development);
    Server.configure('production', production);
}
Server.use(Content.createServer( {views: viewsDir, assets: assets }) );
Server.use(Jobs.createServer( { views: viewsDir, jobvite_company_id: 'qgY9Vfw2', assets: assets }) );

// Required for 404's to return something
Server.get('/*', function(req, res, next) { log('404'); log(req.url); res.send('404: ' + req.url + ' not found'); next(); });

// For spark, an app launcher
module.exports.server = Server;

Server.listen(port, null);
log('Starting OPOWER JOBS...');


