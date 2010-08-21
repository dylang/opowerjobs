require.paths.unshift('./support');
require.paths.unshift('./support/connect/lib');

require('proto');

var log = require('./lib/util/log').from(__filename),
    Connect = require('connect'),
    Express = require('express'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    assets = require('./lib/assets'),

    jsonToHTML = require('./lib/util/prettyJSON'),

    Content = require('./lib/content'),
    Jobs = require('./lib/jobs'),

    viewsDir = __dirname + '/views',
    port = parseInt(process.env.PORT || 3000),
    Server = Express.createServer();


function common() {
    Server.set('views', viewsDir);
    //Server.use(Connect.gzip());
    //Server.use(Connect.favicon(__dirname + '/public/favicon.ico'));
    
    Server.use(assetManager(assets.config));
    Server.use(Connect.staticProvider(__dirname + '/public'));
    Server.helpers({assets: assets, currentPageID: false, pages: []});
    //Server.use(Server.router);

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

Server.error(function(err, req, res, next){
        res.render('generic.ejs', { locals: { title: 'Error', message: jsonToHTML(err) } });
        log('ERROR');
        log(err);
});

Server.configure('development', development);

//hack for testing poduction settings
if (port != 3000) {
    Server.configure(production);
} else {
    Server.configure('production', production);
}
// Required for 404's to return something

/*
Server.get('/*', function(req, res, next){

    var host = req.headers.host;
    if (host != 'localhost' && host != 'www.opowerjobs.com') {
        res.redirect('http://www.opowerjobs.com' + req.originalUrl);
    }
    next();
});
*/





Server.use(Content.createServer( {views: viewsDir, assets: assets }) );
Server.use(Jobs.createServer( { views: viewsDir, jobvite_company_id: 'qgY9Vfw2', assets: assets }) );


// Required for 404's to return something
Server.get('/*', function(req, res){
    log('404: ' + req.url);
    res.render('generic.ejs', { locals: { message: "404 man, 404." } });
});


// For spark, an app launcher
module.exports.server = Server;

Server.listen(port, null);
log('Starting OPOWER JOBS on ' + port + '...');


