
var connect = require('./deps/connect'),
    express = require('./deps/express'),
    log = require('./lib/util/log').from(__filename),
    content = require('./lib/content'),
    jobs = require('./lib/jobs/jobs'),
    viewsDir = __dirname + '/views',

    app = express.createServer(/*connect.logger()*/);

app.configure(function(){
    app.set('views', viewsDir);
    app.set('reload views', 1000);
    app.set('reload layout', 1000);
});


app.use('/', content.createServer( {views: viewsDir }) );
app.use('/jobs', jobs.createServer( { views: viewsDir, jobvite_company_id: 'qgY9Vfw2' }) );
app.use('/public', connect.staticProvider(__dirname + '/public'));

app.get('/:a?/:b?/:c?', function(req, res, next) { log('404'); log(req.url); res.send('not found'); });

app.listen(3000);
log('Starting OPOWER JOBS...');









