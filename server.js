/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

require.paths.unshift('./support');
require.paths.unshift('./support/connect/lib');
require('./support/proto');

var log = require('./lib/util/log').from(__filename),
    MemoryStore = require('./support/connect/lib/connect/middleware/session/memory'),
    Express = require('express'),
    Assets = require('./lib/assets'),

    objToHTML = require('./lib/util/prettyJSON'),

    ReferralHandler = require('./lib/referralHandler'),
    ContentHandler = require('./lib/contentHandler'),
    JobHandler = require('./lib/jobHandler'),

    Server = module.exports = Express.createServer();

var VIEWS = __dirname + '/views',
    PUBLIC = __dirname + '/public',
    PORT = parseInt(process.env.PORT || 3000),
    HOSTNAME = 'opowerjobs.com';

//hack for testing production settings.  slug == heroku.
if (PORT != 3000 || __dirname.indexOf('slug') !== -1) {
    Server.set('env', 'production');
}

//in case of crash. I've never seen this used, got it from somebody else's code.
process.title = 'opowerjobs';
process.addListener('uncaughtException', function (err, stack) {
    console.log(err);
    console.log(stack);
    log('*************************************');
    log('************EXCEPTION****************');
    log('*************************************');
    err.message && log(err.message);
    err.stack && log(err.stack);
    log('*************************************');
});

function production(){
    Server.use(Express.conditionalGet());
    Server.use(Express.cache());
    Server.use(Express.gzip());

    log('running in production mode');
    Assets.compress(true);
    JobHandler.autoUpdate();

    Server.helpers({
        href: function(url) { return 'http://' + HOSTNAME + (url[0] == '/' ? '' : '/') + url; }
    });


}

function development() {
    Server.use(Express.conditionalGet());
    Server.use(Express.cache());
    Server.use(Express.gzip());

    Assets.compress(true);
    //JobHandler.autoUpdate(); // TODO: Make it update for testing changelog?

    Server.helpers({
        href: function(url) { return 'http://localhost:' + PORT + (url[0] == '/' ? '' : '/') + url; }
    });

    log('running in development mode');
    //Server.use(Express.errorHandler({ dumpExceptions: true, showStack: true }));
}


function common() {
    Server.set('views', VIEWS);

    Server.helpers({
        debug: objToHTML,
        log: log
    });
    Server.use(Express.cookieDecoder());
    Server.use(Express.session({ store: new MemoryStore({ reapInterval: 60000 * 10 }) }));
    Server.use(Express.bodyDecoder());
    Server.use(Express.favicon(PUBLIC + '/favicon.ico'));
    Server.use(Assets.handler(PUBLIC));
    Server.use(Express.staticProvider(PUBLIC));
    Server.use(Server.router);

    Server.helpers({assets: Assets, currentPageID: false, pages: []});
}


Server.configure('development', development);
Server.configure('production', production);
Server.configure(common);

Server.error(function(err, req, res, next){
        if (err.message != 'EISDIR, Is a directory') {
            log('*************************************');
            log('****************ERROR****************');
            log('*************************************');
            err.message && log(err.message);
            err.arguments && log(err.arguments);
            err.stack && log(err.stack);
            log('*************************************');
        }
        res.redirect('/');
        //res.render('error.ejs', { locals: { title: 'Error', message: objToHTML(err) } });
});

// For Google Webmaster
Server.get('/google97924ebf42be7c40.html', function(req, res){
    res.send('google-site-verification: google97924ebf42be7c40.html');
    res.end();
});



// Get rid of urls that end in / - makes Google Analytics easier to read
Server.get(/^.+\/$/, function(req, res){
    res.redirect(req.url.substr(0, req.url.length - 1));
});

// Redirect other servers to the main one
Server.get(/^/, function(req, res, next){
    var host = req.headers.host.split(':')[0];
    if (host != 'localhost' && host != HOSTNAME) {
        var new_url = 'http://' + HOSTNAME + ':3000' + req.originalUrl;
        log('redirect from:', req.headers.host + req.originalUrl, 'to', new_url);
        res.redirect(new_url);
    } else {
        next();
    }
});

// Reload CSS - sometimes it fails on Heroku
Server.get('/reload', function(req, res, next) {
    Assets.reload();
    next();
});

ReferralHandler.addHandlers( {Server: Server } );
ContentHandler.addHandlers( {Server: Server } );
JobHandler.addHandlers( {Server: Server } );


Server.get('/log', function(req, res) {
    res.render('log.ejs');
});


// Required for 404's to return something
Server.get('/*', function(req, res){
    var host = req.headers.host.split(':')[0],
        new_url;

    if (host == 'localhost' || host == HOSTNAME) {
        if (req.headers['user-agent'] && req.headers['user-agent'].match(/msnbot|slurp/i) === null) {
            log('404', req.url, req.headers.referrer || req.headers.referer || req.headers['user-agent']);
        }
    }

    var array = req.url.split('/');
    if (array.pop() == '') { array.pop(); }

    new_url = array.join('/') || '/';
    res.redirect(new_url);
});

Server.listen(PORT, null);
log('Starting OPOWER JOBS on', PORT);


