(function(){
    var eyes = require('eyes');

    var page_array = [
            {
                label: 'Welcome',
                url: '',
                file: 'index'
            },
            {
                label: 'Our Story',
                url: 'our-story',
                file: 'our-story/story'
            },
            {
                label: 'Working Here',
                url: 'working-here',
                file: 'working-here/working-here'
            },
            {
                label: 'Benefits',
                url: 'working-here/benefits',
                file: 'working-here/benefits'
            },
            {
                label: 'Life in DC',
                url: 'working-here/dc',
                file: 'working-here/dc'
            },
            {
                label: 'College Hiring',
                url: 'working-here/college',
                file: 'working-here/college'
            },
            {
                label: 'Diversity',
                url: 'working-here/diversity',
                file: 'working-here/diversity'
            },
            {
                label: 'Developers',
                url: 'developers',
                file: 'developers/dev'
            },
            {
                label: 'Coding Challenge',
                url: 'developer/challenge',
                file: 'developer/challenge'
            },
            {
                label: 'Jobs',
                url: 'jobs'
            },
            {
                label: 'How to Apply',
                url: 'jobs/apply',
                file: 'jobs/how-to-apply'
            },
            {
                label: 'How we Interview',
                url: 'jobs/interview',
                file: 'jobs/interview'
            }
        ];

    function page_handler(req, res, next, page){
        if (page.file) {
            if (page.url == 'developer/blog') {
                res.redirect('http://www.heyitsopower.com');
            }
            else {
                res.render(page.file + '.ejs', { locals: { active: page.url.search('/') != -1 ? page.url.substr(0, page.url.search('/')) : page.url} });
            }
        } else {
            next();
        }

    }
    exports.page_array = page_array;
    exports.page_handler = page_handler;


})();