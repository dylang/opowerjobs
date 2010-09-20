/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename),
    jobData,
    team_pages = {},
    location_hash = {'arlington': 'DC/Northern Virginia'},
    Format = require('./util/format'),
    Jobvite = require('./jobvite');

var fs = require('fs');

function reload(callback, andSave) {
    Jobvite.download(function(data) {
        if (data) {
            init(data);
        } else {
            log('ERROR', 'No data from update!');
        }
        callback && callback(data);
    }, andSave);
}



function BLAHBLAH() {
    var prev_ids = clone(all_ids);

    //delete prev_ids.ocXkVfw8;
    //prev_ids.o1rmVfwt.title = 'wazzup';


    log('reload');
    init();
    var added = {};

    all_ids.forEach(function(curr, id) {
        var prev = prev_ids[id];
        if (!prev) {
            log('was', id);
            log('added',  curr.id);
        } else {
            if (prev.title != curr.title) {
                log('title changed:', curr.title, 'was', prev.title);
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


function discover_team_pages() {

    var files = fs.readdirSync('./views/partials/teams/'); 
    files.map(function(file){
        var filename = file.split('.');
        if (filename[1] == 'ejs') {
            team_pages[filename[0]] = filename[0];
        }
    });
}



function location_lookup(location) {
    var lookup = location.replace(/,.*/, '')
                         .toLowerCase();
    return location_hash[lookup] ? location_hash[lookup] : lookup;
}

/* make almost any string good for a url path */
function urlize(s) {
    return (s || '').toLowerCase().replace(/[^a-z]+/gi, '-');
}



function remove_html(string) {
    return string.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
}

function create_search_string(job) {
    return remove_html([job.title, job.url.location, job.url.team]
            .join(' ')
            .toLocaleLowerCase());
}




function format_description(desc) {

    desc = desc
            .trim()
            .replace(/Do you[^!]*homes\./, '')
            .replace(/About the Company.*/, '')
            .replace(/OPOWER is an Equal.*/, '')
            .replace(/\n/, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&ndash;/g, "&bull;").replace(/&middot;/g, "&bull;")
            .replace(/\s\s/g, ' ')
            .replace(/<strong>/g, '')
            .replace(/:?<\/strong>/g, '')
            .replace(/<br[^>]*>\s*<br[^>]*>/g, '<br /><br />');

    var j1 = desc.split(/(Primary Responsibilities)|(The Ideal candidate)|(The Job)|(Job Description)|(About the Role)|(About the job)|(About the Job)|(About theJob)|(ABOUT THE JOB)|(Core Responsibilities)|(Responsibilities)|(REQUIREMENTS)|(About You)/);
    var j2 = [];
    var d = [];

    j1.forEach(function(section) {
        if (section) {
        section = section.replace(/^:/g, '')
            .replace(/^<br \/>|<br \/>$/g, '')
            .trim()
            .replace(/^<br \/>|<br \/>$/g, '');
        }
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
                p = p.replace(/<br \/>(<em>)?<\/p>/g, '</p>')
                    .replace(/<p>(<\/em>)?<br \/>/g, '<p>');
            }

            d.push({title: title, p: p });
            i++;
        }
    }
    return d;
}



function search(query) {
    query = remove_html(query).replace(/[^a-zA-Z]/g, ' ').replace(/\s\s/g, ' ') || false;
    if (!query) { return; }
    var jobs = [],
        search_array = query.toLowerCase().split(/[\s|\+]/);

    jobData.all_search.forEach(function(value, key) {
        jobs.push(value);
    });

    search_array.forEach(function(search_for) {
        jobs = jobs.filter(function(value) {
            return value.search_string.search(search_for) !== -1;
        });
    });

    log('search:', query, 'results:', jobs.length);

    return jobs;
}

function similar(jobId) {

    var job = jobData.all_ids[jobId];

    var title = job.title,
        matches = [],
        search_for = (title.toLowerCase().match(/(professional services)|(user experience)|(recruit)|(market)|(director)|(test)|(software engineer)|(architect)|(vp)|(sales)/) || [])[0];

    if (search_for) {
        jobData.all_ids.forEach(function(j) {
            if (j.id != job.id && job.location == j.location && j.title.toLowerCase().search(search_for) !== -1) {
                matches.push(j.id);
            }
        });
    }

    return matches;
}

function create_urls(job) {
    var location_url = job.location.toLowerCase().replace(/[^a-z]+/gi, '-'),

        team = job.team,
        team_url = urlize(team),

        title_url = urlize(job.title),

        long_url = ['', location_url, team_url, title_url ].join('/'),
        apply_url = '/apply' + long_url;

    return {
        location: location_url,
        team: team_url,
        title: title_url,
        long_url: long_url,
        apply: apply_url
    };
}

function format_title(title) {
    return title.trim()
                .replace(/\s?- \w?\w?st Coast/, '')
                .replace('(Arlington, VA)', '')
                .replace('Executives', 'Executive')
                .replace('Engineers', 'Engineer')
                .replace(' - San Francisco', '')
                .replace('Sr.', 'Senior')
                .trim();
}



function init(new_data) {
    var raw_data = (new_data || Jobvite.data()).job;

    var job_array = [];

    raw_data.forEach(function(job) {

        job.title = format_title(job.title);

        // use team instead of category
        job.team = job.category;

        // location
        job.location = location_lookup(job.location);

        /// Url requires proper title, team, and location
        job.url = create_urls(job);

        job_array.push(job);
    });

    var data = {
        all_jobs: {},
        all_locations: {},
        all_teams: {},
        all_ids: {},
        all_search: {},
        all_urls: {},
        all_new: [],
        all_critical: []
    },

    // keep these sort guys inside the same closure as the data so they can access it for sorting.
    sort_team = function(a, b) {
        if (a.team < b.team) return -1;
        if (a.team > b.team) return 1;
        return 0;
    },
    sort_title = function(a, b) {

        a = a.title ? a : data.all_ids[a];
        b = b.title ? b : data.all_ids[b];

        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
    },
    sort_date = function(a, b) {

        a = a.date ? a : data.all_ids[a];
        b = b.date ? b : data.all_ids[b];

        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    };

    job_array.sort(sort_team);

    job_array.forEach(function(job) {

        var urls = job.url;

        if (data.all_urls[urls.long_url]) {
            log('Duplicate:', job.id, urls.long_url, 'of', data.all_urls[urls.long_url]);
            data.all_urls['/' + job.id] = data.all_urls[urls.long_url];
        }
        else {

            // Massive update to Jobvite Data

            //Iso Date
            job.date = new Date(job.date + ' ' + Format.createTimeFromString(job.id));
            job.isoDate = Format.ISODateString(job.date);
            job.description = format_description(job.description);

            // Critical Job
            if (job.requisitionId.length) {
                job.critical = job.requisitionId.toLowerCase().indexOf('critical') !== -1;
            }

            // These fields are not used
            delete job.category;
            delete job['apply-url'];
            delete job['detail-url'];
            delete job.requisitionId;
            delete job.briefdescription;


            // Hash of all urls
            data.all_urls[urls.long_url] = job.id;
            data.all_urls['/' + job.id] = job.id;

            // All you need is the job title
            if (!data.all_urls['/' + urls.title]) {
                data.all_urls['/' + urls.title] = job.id;
            }

            data.all_locations[urls.location] = job.location;
            data.all_teams[urls.team] = job.team;
            data.all_ids[job.id] = job;

            data.all_new.push(job.id);
            if (job.critical) {
                data.all_critical.push(job.id);
            }

            data.all_search[job.id] = {
                search_string: create_search_string(job),
                title: job.title,
                url: urls,
                id: job.id,
                location: job.location,
                team: job.team};


            var location = urls.location;
            data.all_jobs[location] = data.all_jobs[location] || {};

            var team = urls.team;
            data.all_jobs[location][team] = data.all_jobs[location][team] || [];
            data.all_jobs[location][team].push(job.id);
        }
    });

    data.all_jobs.forEach(function(location, location_key){
        data.all_jobs[location_key].forEach(function(team, team_key) {
            data.all_jobs[location_key][team_key].sort(sort_title);
        });
    });

    data.all_new.sort(sort_date);
    data.all_critical.sort(sort_title);

    //If we want similar then do a loop over all the jobData.ids
    //data.all_ids[job_id].similar = similar(job_id);

    // TODO: Do compare with previous data here.

    jobData = data;

    log('init complete', 'total jobs:', Object.keys(jobData.all_ids).length, 'critical:', jobData.all_critical.length);
    return jobData;


}

init(false);
discover_team_pages();

module.exports.data = function() { return jobData; };
module.exports.urilze = urlize;
module.exports.search = search;
module.exports.reload = reload;
module.exports.team_pages = team_pages;
