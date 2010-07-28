var connect = require('connect'),
   express = require('express'),
   eyes = require('eyes'),
   pages = require('./pages').pages;

    var app = express.createServer(/*connect.logger()*/);

    app.use('/public', connect.staticProvider(__dirname + '/public'));

    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('reload views', 1000);
        app.set('reload layout', 1000);
    }); 


    pages.forEach(function(page){
        app.get('/' + page.url, function(req, res){
            if (page.url == 'dev') {
                res.redirect('http://www.heyitsopower.com');
            }
            else {
                res.render((page.file || page.url) + '.ejs', { locals: { pages: pages, eyes: eyes, active: page.url.search('/') != -1 ? page.url.substr(0, page.url.search('/')) : page.url} });
            }
        });

    });

   app.listen(3000);

   console.log('\nStarting OPOWER JOBS...\n');
