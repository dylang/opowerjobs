(function(){
    var Connect = require('connect'),
        Express = require('express'),
        log = require('./util/log').from(__filename),
        jsonToHTML = require('./util/prettyJSON'),
        pages = require('./pages').tree;

 
    function page_handler(req, res, next, page){
        log(req.url);
        if (page.url == 'developer/blog') {
            res.redirect('http://www.heyitsopower.com');
        }
        else {
            res.render(page.file + '.ejs', { locals: { currentPageID: page.id, title: page.label } });
        }
    }



    function createServer(options) {
        var Server = Express.createServer(/* connect.logger() */);

        Server.configure(function(){
            Server.set('views', options.views);
            //Server.use(Server.router);
        });

        Server.helpers({
            pages: pages,
            log: log,
            debug: jsonToHTML,
            assets: options.assets
        });

        pages.forEach(function(page){
            if (page.file) {
                Server.get('/' + page.url, function(req, res, next) { page_handler(req, res, next, page); });
            }
            page.children.forEach(function(page) {
                if (page.file) {
                    Server.get('/' + page.url, function(req, res, next) { page_handler(req, res, next, page); });
                }
            });
        });


        log('ready.');

        return Server;
    }

    exports.createServer = createServer;

})();
