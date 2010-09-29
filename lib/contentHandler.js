/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename),
    pages = require('./pages').tree;


function page_handler(req, res, next, page) {
    if (page.url == 'developer/blog') {
        res.redirect('http://www.heyitsopower.com');
    }
    else {
        res.render(page.file + '.ejs', { locals: { currentPageID: page.id, title: page.url != '' ? page.label : '', data: page } });
    }
}

function addHandlers(options) {
    var Server = options.Server;

    Server.helpers({
        pages: pages,
        currentPageID: false
    });

    pages.forEach(function(page) {
        if (page.file) {
            Server.get('/' + page.url, function(req, res, next) {
                page_handler(req, res, next, page);
            });
        }
        page.children && page.children.forEach(function(page) {
            if (page.file) {
                Server.get('/' + page.url, function(req, res, next) {
                    page_handler(req, res, next, page);
                });
            }

            page.children && page.children.forEach(function(page) {
                if (page.file) {
                    Server.get('/' + page.url, function(req, res, next) {
                        page_handler(req, res, next, page);
                    });
                }
            });
        });
    });
    Server.get('/*', function(req,res,next) {next();});

    return Server;
}

exports.addHandlers = addHandlers;

