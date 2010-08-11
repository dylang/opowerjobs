(function(){
    var connect = require('connect'),
        express = require('express'),
        log = require('./util/log').from(__filename),
        jsonToHTML = require('./util/prettyJSON'),
        pages = require('./pages').page_array;

 
    function page_handler(req, res, next, page){
        if (page.file) {
            if (page.url == 'developer/blog') {
                res.redirect('http://www.heyitsopower.com');
            }
            else {
                res.render(page.file + '.ejs', { locals: { page: page, active: page.url.search('/') != -1 ? page.url.substr(0, page.url.search('/')) : page.url} });
            }
        } else {
            next();
        }

    }



    function createServer(options) {
        var app = express.createServer(/* connect.logger() */);

        app.configure(function(){
            app.set('views', options.views);
            app.set('reload views', 1000);
        });

        app.helpers({
            pages: pages,
            log: log,
            debug: jsonToHTML
        });

        pages.forEach(function(page){
            app.get('/' + page.url, function(req, res, next) { page_handler(req, res, next, page); });
        });


        log('ready.');

        return app;
    }

    exports.createServer = createServer;

})();
