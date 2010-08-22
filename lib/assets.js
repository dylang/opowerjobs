var log = require('./util/log').from(__filename),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    compress = false,
    build = +(new Date()),
    css = [
            'reset.css',
            'grid.css',
            'fonts.css',
            'base.css',
            'defaults.css',
            'theme.css',
            'button.css',
            'search.css',
            'jobs.css',
            'navigation.css',
            'images.css',
            'flag.css',
            'icons.css',
            'job.css',
            'department.css'
         ],

    js = [
            'jquery-1.4.2.js',
            'jquery-ui-1.8.2.custom.min.js',
            'scrollable.js',
            'tabs.js',
            'site.js',
            'toggleGrid.js'
        ];

    function fixImageUrls(file, path, index, isLast, callback) {
            callback(file
                .replace(/url\(data:/g, '!URLDATA!')
                .replace(/url\(([^)]+)\)/g, 'url(/css/$1)')
                .replace(/!URLDATA!/g, 'url(data:')
                );
    }

    function config(publicDir) {
        return {
            css: {
                route: /css\/[0-9]+\/compressed\.css/,
                path: './public/css/',
                dataType: 'css',
                debug: false,
                files: css,
                preManipulate: {
                    '^': [
                        fixImageUrls
                        //assetHandler.fixVendorPrefixes,
                        //assetHandler.fixGradients//,
                        //assetHandler.replaceImageRefToBase64(publicDir)
                    ]
                },
                postManipulate: {
                    '^': [
                        //assetHandler.yuiCssOptimize

                    ]
                }
            },
            js: {
                route: /js\/[0-9]+\/compressed\.js/,
                path: './public/js/',
                dataType: 'javascript',
                debug: false,
                files: js
            }
        };
    }

function styles() {
    if (compress) {
        return '<link href="/css/' + build + '/compressed.css" rel="stylesheet"  type="text/css"/>';
    }

    var out = [], cacheBuster = Math.round(Math.random() * build);
    css.forEach(function(file) {
        out.push('<link href="/css/' + file + '?' + cacheBuster + '" rel="stylesheet"  type="text/css"/>');
    });
    return out.join('\n');
}

function scripts() {
    if (compress) {
        return '<script type="text/javascript" src="/js/' +  build + '/compressed.js"></script>';
    }

    var out = [], cacheBuster = Math.round(Math.random() * build);
    js.forEach(function(file) {
        out.push('<script type="text/javascript" src="/js/' + file + '?' +  cacheBuster + '"></script>');
    });
    return out.join('\n');
}

function change_compress(value) {
    compress = value;
}

function handler(publicDir) {
    return assetManager(config(publicDir));
}

module.exports.compress = change_compress;
module.exports.scripts = scripts;
module.exports.styles = styles;
module.exports.handler = handler;
