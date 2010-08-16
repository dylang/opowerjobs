
var cache = require('./util/cache'),
    log = require('./util/log').from(__filename),
    all_jobs = {}, all_locations = {}, all_departments = {}, all_ids = {}, all_search = {}, all_urls = {};
    location_hash = {'arlington': 'DC/Northern Virgina'},
    jobvite_xml_listing = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=', //qgY9Vfw2
    jobvite_company_id = 'qgY9Vfw2';

function location_lookup(location) {
    var lookup = location.toLowerCase();
    return location_hash[lookup] ? location_hash[lookup] : location;
}

/* make almost any string good for a url path */
function urlize(s) {
    return (s || '').toLowerCase().replace(/[^a-z]+/gi, '-');
}
function create_job_url(job) {
    var location_url = job.location.toLowerCase().replace(/[^a-z]+/gi, '-');

    var department = job.department;
    var department_url = urlize(department);

    var title_url = urlize(job.title);

    var long_url = ['', location_url, department_url, title_url ].join('/');
    var apply_url = '/apply' + long_url;
    return {location: location_url, department: department_url, title: title_url, long_url: long_url, apply: apply_url };
}


function remove_html(string) {
    return string.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
}

function create_search_string(job) {
    return remove_html([job.title, job.location, job.url.location, job.url.department, job.department, job.description]
            .join(' ')
            .toLocaleLowerCase());
}


var sort_departments = function(a, b) {
    if (a.department < b.department) return -1;
    if (a.department > b.department) return 1;
    return 0;
};

var sort_titles = function(a, b) {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
};

function format_results(data) {
    var jobs = { },
        locations = {};

    data.sort(sort_departments);
    //data.sort(sort_titles);

    data.forEach(function(job) {

        var urls = job.url;

        if (!all_urls[urls.long_url]) {


            all_urls[urls.long_url] = job.id;
            if (!all_urls['/' + urls.title]) {
                all_urls['/' + urls.title] = job.id;
            }

            all_locations[urls.location] = job.location;
            all_departments[urls.department] = job.department;
            all_ids[job.id] = job;
            all_search[job.id] = {
                search_string: create_search_string(job),
                title: job.title,
                url: urls,
                id: job.id,
                location: job.location,
                department: job.department};


            var location = urls.location;
            locations[location] = locations[location] || {};

            var department = urls.department;
            locations[location][department] = locations[location][department] || [];
            locations[location][department].push(job);
        }
    });

    locations.forEach(function(location, location_key){
        locations[location_key].forEach(function(department, department_key) {
            locations[location_key][department_key].sort(sort_titles);

            locations[location_key][department_key].forEach(function(job, job_id) {

                job.similar = similar(job);
            });
        });
    });


    jobs.locations = locations;

    return jobs;
}

function init() {
    var count = 0,
        duplicates = 0,
        data = cache.data('jobs');

    var jobs = [];

    data.job.forEach(function(job) {
        count++;
        //remove west coast / east coast
        job.title = job.title
                .replace(/\s?- \w?\w?st Coast/, '')
                .replace('(Arlington, VA)', '')
                .replace('Sr.', 'Senior');

        job.description = job.description
                .trim()
                .replace(/Do you[^!]*!/, '')
                .replace(/<strong>About the Company.*/, '')
                .replace(/\n/, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/\s\s/g, ' ')
                .replace(/<br[^>]*>\s*<br[^>]*>/g, '<br />')
                .replace(/<br[^>]*>\s*<br[^>]*>/g, '<br />')
                .replace(/^\s*<br[^>]*>/g, '')

        job.department = job.category;
        delete job.category;

        job.location = location_lookup(job.location.replace(/,.*/, ''));

        job.url = create_job_url(job);

        jobs.push(job);
    });

    all_jobs = format_results(jobs);
}


function search(query) {
    query = remove_html(query).replace(/[^a-zA-Z]/g, ' ').replace(/\s\s/g, ' ') || false;
    if (!query) { return; }
    var jobs = [],
        search_array = query.toLowerCase().split(/[\s|\+]/);

    all_search.forEach(function(value, key) {
        jobs.push(value);
    });

    search_array.forEach(function(search_for) {
        jobs = jobs.filter(function(value, key) {
            return value.search_string.search(search_for) !== -1;
        });
    });

    return jobs;
}

function similar(job) {

    

    var title = job.title,
        matches = [],
        search_for = (title.toLowerCase().match(/(professional services)|(user experience)|(recruit)|(market)|(director)|(test)|(software engineer)|(architect)|(vp)|(sales)/) || [])[0];

    if (search_for) {
    all_ids.forEach(function(j, job_id) {
        if (j.id != job.id && job.location == j.location && j.title.toLowerCase().search(search_for) !== -1) {
            matches.push(j);
        }
    });
    }

    return matches;
}


init();

module.exports = { all_jobs: all_jobs, all_locations: all_locations, all_departments: all_departments, all_ids: all_ids, all_urls: all_urls };
module.exports.urilze = urlize;
module.exports.search = search;