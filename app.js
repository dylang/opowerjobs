require.paths.unshift("./deps");

require('proto');

var connect = require('connect'),
        express = require('express'),
        assetManager = require('connect-assetmanager'),
        assetHandler = require('connect-assetmanager-handlers'),
        log = require('./lib/util/log').from(__filename),
        content = require('./lib/content'),
        jobs = require('./lib/jobs'),
        viewsDir = __dirname + '/views',

        app = express.createServer(),


        assets = assetManager({
            css: {
                route: /css\/compressed\.css/,
                path: './public/css/',
                dataType: 'css',
                debug: false,
                files: [
                    'jqueryui/flick/jquery-ui-1.8.2.custom.css',
                    'reset.css',
                    'grid.css',
                    'fonts.css',
                    'base.css',
                    'jobs.css'
                ],
                preManipulate: {
                    '^': [
                        assetHandler.fixVendorPrefixes,
                        assetHandler.fixGradients//,
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
                route: /js\/compressed\.js/,
                path: './public/js/',
                dataType: 'javascript',
                debug: false,
                files: [
                    'jquery-1.4.2.js',
                    'jquery-ui-1.8.2.custom.min.js',
                    'scrollable.js',
                    'tabs.js',
                    'site.js',
                    'toggleGrid.js'
                ]
            }
        });

app.configure(function(){
    app.set('views', viewsDir);
    //app.set('reload views', 1000);
    //app.set('reload layout', 1000);
    //app.use(connect.conditionalGet());
    //app.use(connect.gzip());
    //app.use(connect.logger());
    app.use(assets);
    app.use(connect.staticProvider(__dirname + '/public'));
});


//app.use('/', assetsManagerMiddleware);
//app.use('/', connect.staticProvider(__dirname + '/public'));
app.use(content.createServer( {views: viewsDir }) );
app.use(jobs.createServer( { views: viewsDir, jobvite_company_id: 'qgY9Vfw2' }) );
app.get('/:a?/:b?/:c?', function(req, res, next) { log('404'); log(req.url); res.send('404: ' + req.url + ' not found'); next(); });

app.listen(parseInt(process.env.PORT || 3000), null);
log('Starting OPOWER JOBS...');









