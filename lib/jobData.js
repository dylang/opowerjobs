
var log = require('./util/log').from(__filename),
    all_jobs, all_locations, all_departments, all_ids, all_search, all_urls,
    all_new, all_critical,
    location_hash = {'arlington': 'DC/Northern Virginia'},
    Jobvite = require('./jobvite');


function update(callback) {
    Jobvite.update(function() {
        reload();
        callback && callback();
    });
}

function autoUpdate() {
    Jobvite.reload(function(new_data) {
        if (new_data) {
            log('autoupdate data');
            var data =JSON.parse(new_data);
            init(data);
        }
        setTimeout(autoUpdate, 43200000);
    });
}

function reload() {
    var prev_ids = clone(all_ids);

    //delete prev_ids.ocXkVfw8;
    //prev_ids.o1rmVfwt.title = 'wazzup';


    log('reload');
    init();
    var added = {};

    all_ids.forEach(function(curr, id) {
        var prev = prev_ids[id];
        if (!prev) {
            log (prev);
            log('was ' + id);
            log('added: ' + curr.id);
        } else {
            if (prev.title != curr.title) {
                log('title changed: ' + curr.title + ' was '  + prev.title);
            }
        }
    });

}

function clone(orig) {
    var copy = {};
    orig.forEach(function(data, id) {
        log(id);
        return copy[id] = data;
    });
    return copy;    
}


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
    return remove_html([job.title, job.url.location, job.url.department]
            .join(' ')
            .toLocaleLowerCase());
}


var sort_department = function(a, b) {
    if (a.department < b.department) return -1;
    if (a.department > b.department) return 1;
    return 0;
},
    sort_title = function(a, b) {
    a = a.title ? a : all_ids[a];
    b = b.title ? b : all_ids[b];

    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
},
    sort_date = function(a, b) {
    a = a.date ? a : all_ids[a];
    b = b.date ? b : all_ids[b];

    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
    };

function format_description(desc) {

    desc = desc
            .trim()
            .replace(/Do you[^!]*!/, '')
            .replace(/About the Company.*/, '')
            .replace(/\n/, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s\s/g, ' ')
            .replace(/<strong>/g, '')
            .replace(/:?<\/strong>/g, '')
            .replace(/<br[^>]*>\s*<br[^>]*>/g, '<br />');

    var j1 = desc.split(/(Job Description)|(About the Role)|(ABOUT THE JOB)|(Core Responsibilities)|(Responsibilities)|(REQUIREMENTS)|(About You)/i);
    var j2 = [];
    var d = [];

    j1.forEach(function(section) {
        if (section) { j2.push(section); }
    });

    j2 = j2.map(function(section) {
        return section
            .replace(/^:/g, '')
            .replace(/^<br \/>|<br \/>$/g, '')
            .trim()
            .replace(/^<br \/>|<br \/>$/g, '');

    });

    var i, l;

    for (i=0, l=j2.length; i<l; i++) {
        if (j2[i].length) {
            var title = j2[i],
                p = j2[i+1];

            if (p && p.search(/^<ul/) === -1) {
                p = '<p>' + p + '</p>';
            }

            d.push({title: title, p: p });
            i++;
        }
    }
    return d;
}


function format_results(data) {
    var jobs = { };

    data.sort(sort_department);
    //data.sort(sort_titles);

    data.forEach(function(job) {

        var urls = job.url;

        if (all_urls[urls.long_url]) {
            log('Duplicate: ' + urls.long_url);
        }
        else {

            all_urls[urls.long_url] = job.id;
            if (!all_urls['/' + urls.title]) {
                all_urls['/' + urls.title] = job.id;
            }

            job.description = format_description(job.description);

            all_locations[urls.location] = job.location;
            all_departments[urls.department] = job.department;
            all_ids[job.id] = job;
            all_new.push(job.id);
            if (job.critical) {
                all_critical.push(job.id);
            }

            all_search[job.id] = {
                search_string: create_search_string(job),
                title: job.title,
                url: urls,
                id: job.id,
                location: job.location,
                department: job.department};



            var location = urls.location;
            jobs[location] = jobs[location] || {};

            var department = urls.department;
            jobs[location][department] = jobs[location][department] || [];
            jobs[location][department].push(job);
        }
    });

    jobs.forEach(function(location, location_key){
        jobs[location_key].forEach(function(department, department_key) {
            jobs[location_key][department_key].sort(sort_title);

            jobs[location_key][department_key].forEach(function(job, job_id) {

                job.similar = similar(job);
            });
        });
    });

    all_new.sort(sort_date);
    all_critical.sort(sort_title);

    log('unique ids: ' + Object.keys(all_ids).length);
    log('new count: ' + all_new.length);
    log('critical count: ' + all_critical.length);
    return jobs;
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

function init(new_data) {

    all_jobs = {}, all_locations = {}, all_departments = {}, all_ids = {}, all_search = {}, all_urls = {},
        all_new = [], all_critical = [];

    var count = 0,
        duplicates = 0,
        data = new_data || Jobvite.data();

    var jobs = [];

    data.job.forEach(function(job) {
        count++;
        //remove west coast / east coast
        job.title = job.title
                .replace(/\s?- \w?\w?st Coast/, '')
                .replace('(Arlington, VA)', '')
                .replace('Engineers', 'Engineer')
                .replace('Sr.', 'Senior');

        job.department = job.category;
        delete job.category;

        job.location = location_lookup(job.location.replace(/,.*/, ''));

        job.url = create_job_url(job);

        if (job.requisitionId.length) {
            job.critical = job.requisitionId.toLowerCase().indexOf('critical') !== -1;
        }

        job.date = new Date(job.date);

        jobs.push(job);
    });
    log('job count: ' + jobs.length);

    all_jobs = format_results(jobs);
    log('init complete');
}




init();

module.exports = { all_jobs: all_jobs, all_locations: all_locations, all_departments: all_departments, all_ids: all_ids, all_urls: all_urls, all_critical: all_critical, all_new: all_new };
module.exports.urilze = urlize;
module.exports.search = search;
module.exports.update = update;
module.exports.autoUpdate = autoUpdate;