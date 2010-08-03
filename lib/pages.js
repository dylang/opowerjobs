(function(){
    var eyes = require('eyes');

    var page_array = [
            {
                url: '',
                file: 'index',
                label: 'Home'
            },
            {
                url: 'story',
                label: 'Story'
            },
            {
                url: 'opportunities/benefits',
                label: 'Benefits',
                file: 'benefits'
            },
            {
                url: 'opportunities/dc',
                label: 'Life in DC',
                file: 'dc'
            },
            {
                url: 'opportunities/college',
                label: 'College Hiring',
                file: 'college'
            },
            {
                url: 'opportunities/diversity',
                label: 'Diversity',
                file: 'diversity'
            },
            {
                url: 'opportunities/apply',
                label: 'How to Apply',
                file: 'apply'
            },
            {
                url: 'opportunities/interview',
                label: 'How we Interview',
                file: 'interview'
            },
            {
                url: 'opportunities/challenge',
                label: 'Coding Challenge',
                file: 'challenge'
            },
            {
                url: 'culture',
                label: 'Culture'
            },
            {
                url: 'opportunities',
                label: 'Opportunities'
            }
        ];

    function page_handler(res, page){
        if (page.url == 'dev') {
            res.redirect('http://www.heyitsopower.com');
        }
        else {
            res.render((page.file || page.url) + '.ejs', { locals: { pages: page_array, eyes: eyes, active: page.url.search('/') != -1 ? page.url.substr(0, page.url.search('/')) : page.url} });
        }
    }
    exports.page_array = page_array;
    exports.page_handler = page_handler;


})();