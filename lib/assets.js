/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */
var log = require('logging').from(__filename),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    compress = false,
    version = +(new Date()),

    PUBLIC_DIR  = __dirname.replace(/\/lib$/, '/public'),
    CSS_DIR     = 'public/css/',
    JS_DIR      = 'public/js/',
    ams         = require('ams').build.create(PUBLIC_DIR),

    css = [
            'jqueryui.css',
            'fancybox.css',
            'reset.css',
            'grid.css',
            'base.css',
            'defaults.css',
            'theme.css',
            'button.css',
            'search.css',
            'jobs.css',
            'list-of-jobs.css',
            'navigation.css',
            'images.css',
            'flag.css',
            'tabs.css',
            'icons.css',
            'job.css',
            'menu.css',
            'dropdown.css',
            'team.css',
            'mustache.css',
            'log.css'
         ],

    js = [
            'site.js',
            'jquery.fancybox-1.3.1.js',
            'dropdown.js',
            'toggleGrid.js'
        ];

log(__dirname);

function compress_everything() {
    css.forEach(function(filename) {
        ams.add(CSS_DIR + filename, CSS_DIR);
    });
    js.forEach(function(filename) {
        ams.add(JS_DIR + filename, JS_DIR);
    });

    ams
        .process({
            uglifyjs:       false,
            cssvendor:      false,
            cssdataimg:     false,
            cssimport:      false,
            cssabspath:     {host: '..'},
            htmlabspath:    false,
            cssmin:         false,
            jstransport:    false,
            texttransport:  false
        })
        .combine({
            js: 'combined.js',
            css: 'combined.css'
        })
        .process({
            uglifyjs:       true,
            cssvendor:      false,
            cssdataimg:     false,
            cssimport:      false,
            cssabspath:     false,
            htmlabspath:    false,
            cssmin:         true,
            jstransport:    false,
            texttransport:  false
        })
        .write(PUBLIC_DIR + '/compressed')
        .end();
}

function styles(options) {

    if (compress || options.compress) {
        return '<link href="/compressed/combined.css?' + version + '" rel="stylesheet" type="text/css"/>';
    }

    var out = [], cacheBuster = ''; //'?' + Math.round(Math.random() * build);
    css.forEach(function(file) {
        out.push('<link href="/css/' + file + cacheBuster + '" rel="stylesheet"  type="text/css"/>');
    });
    return out.join('\n');
}

function scripts(options) {

    if (compress || options.compress) {
        return '<script type="text/javascript" src="/compressed/combined.js?' + version + '"></script>';
    }

    var out = [], cacheBuster = '';
    js.forEach(function(file) {
        out.push('<script type="text/javascript" src="/js/' + file + cacheBuster + '"></script>');
    });
    return out.join('\n');
}

function addHandler(options) {
    var Server = options.Server;

    compress = Server.set('env') == 'production';

    Server.dynamicHelpers({
        styles: function(req) {
            return styles({compress: ('compress' in req.query)});
        },
        scripts: function(req) {
            return scripts({compress: ('compress' in req.query)});
        }
    });
}

compress_everything();

module.exports.addHandler = addHandler;


