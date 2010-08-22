require.paths.unshift('./support');
require.paths.unshift('./support/connect/lib');

require('proto');

var log = require('./lib/util/log').from(__filename),
    Connect = require('connect'),
    Express = require('express'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    assets = require('./lib/assets'),

    objToHTML = require('./lib/util/prettyJSON'),

    Content = require('./lib/content'),
    Jobs = require('./lib/jobs'),

    viewsDir = __dirname + '/views',
    port = parseInt(process.env.PORT || 3000),
    public_host = 'opowerjobs.heroku.com',
    Server = Express.createServer();


function common() {
    Server.set('views', viewsDir);

    Server.helpers({
        debug: objToHTML,
        log: log
    });

    Server.use(Connect.gzip());
    Server.use(Connect.favicon(__dirname + '/public/favicon.ico'));
    
    Server.use(assetManager(assets.config));
    Server.use(Connect.staticProvider(__dirname + '/public'));
    Server.helpers({assets: assets, currentPageID: false, pages: []});
    Server.use(Server.router);
}

function production(){
    log('starting in production mode');
    //app.use(Connect.logger());
    Server.use(Connect.conditionalGet());
    Server.use(Connect.errorHandler());
    assets.compress();
}

function development() {
    log('starting in development mode');
    Server.use(Connect.errorHandler({ dumpExceptions: true, showStack: true }));
}

Server.configure(common);

Server.configure('development', development);

//hack for testing poduction settings
if (port != 3000) {
    Server.configure(production);
} else {
    Server.configure('production', production);
}

Server.error(function(err, req, res, next){
        res.render('generic.ejs', { locals: { title: 'Error', message: jsonToHTML(err) } });
        log('ERROR');
        log(err);
});


// Redirect other servers to the main one
Server.get('/*', function(req, res, next){
    var host = req.headers.host.split(':')[0];
    if (host != 'localhost' && host != public_host) {
        res.redirect('http://' + public_host + req.originalUrl);
    } else {
        next();
    }
});



Content.createServer( {Server: Server });
Jobs.createServer( { Server: Server});



// Required for 404's to return something
Server.get('/*', function(req, res){
    log('404: ' + req.url);
    var host = req.headers.host.split(':')[0];
    if (host == public_host) {
        res.redirect('http://' + public_host);
    } else {
        res.render('generic.ejs', { locals: { message: "404, man, 404." } });
    }
});


// For spark, an app launcher
module.exports.server = Server;

Server.listen(port, null);
log('Starting OPOWER JOBS on ' + port + '...');


