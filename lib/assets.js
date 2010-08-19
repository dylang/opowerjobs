var log = require('./util/log').from(__filename),
    compress = false,
    build = +(new Date()),
    css = [
            'jqueryui/flick/jquery-ui-1.8.2.custom.css',
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
        ],

    config = {
        css: {
            route: /css\/[0-9]+\/compressed\.css/,
            path: './public/css/',
            dataType: 'css',
            debug: false,
            files: css,
            preManipulate: {
                '^': [
                    //assetHandler.fixVendorPrefixes,
                    //assetHandler.fixGradients//,
                    //assetHandler.replaceImageRefToBase64(__dirname + '/public')
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
module.exports.compress = change_compress;
module.exports.scripts = scripts;
module.exports.styles = styles;
module.exports.config = config;