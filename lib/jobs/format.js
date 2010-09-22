/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('../util/log').from(__filename),
    duplicates = {},
    Constants = require('./constants');


function pad(n) { return n <10 ? '0' + n : n; }

function createTimeFromString(str) {
    str = str || '000000';
    var seconds = parseInt(str.substr(1, 4), 36) % 86400;
    var hours = Math.floor(seconds/3600);
    var minutes = Math.floor((seconds-(hours*3600))/60);
    seconds = seconds - hours * 3600 - minutes * 60;
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
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


function create_urls(job) {
    var team = job.team,
        team_url = urlize(team),

        title_url = urlize(job.title),

        long_url = ['', Constants.url(job.location), team_url, title_url ].join('/'),
        apply_url = '/apply' + long_url;

    return {
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



function jobData(raw_data) {
    if (!raw_data || !raw_data.job) { return; }

    var job_array = [];

    //Set up initial array
    raw_data.job.forEach(function(job) {

        job.title = format_title(job.title);

        // use team instead of category
        job.team = job.category;

        // location
        job.location = Constants.id(job.location);
        /// Url requires proper title, team, and location
        job.url = create_urls(job);


        //Iso Date
        job.date = new Date(job.date + ' ' + createTimeFromString(job.id));
        job.isoDate = job.date.toISOString();

        job_array.push(job);
    });

    // This container will hold all data
    // TODO: remove the all_ part of the names.
    var data = {
        all_jobs: { va: {}, sf: {}},
        all_teams: {},
        all_ids: {},
        all_search: {},
        all_urls: {},
        all_new: [],
        all_critical: []
    },

    // Keep these sort functions inside the same closure as the data so they can access it for sorting.
    sort_team = function(a, b) {
        if (a.team < b.team) return -1;
        if (a.team > b.team) return 1;
        return sort_title(a, b);
    },
    sort_title = function(a, b) {

        a = a.title ? a : data.all_ids[a];
        b = b.title ? b : data.all_ids[b];

        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return sort_date(a, b);
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
            if (!duplicates[job.id]) {
                log('Duplicate:', job.id, 'of', data.all_urls[urls.long_url], 'http://opower.jobs' + urls.long_url);
                duplicates[job.id] = data.all_urls[urls.long_url];
            }
            data.all_urls['/' + job.id] = data.all_urls[urls.long_url];
        }
        else {

            // Massive update to Jobvite Data

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


            var location = job.location;

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

    return data;
}



module.exports.jobData = jobData;
module.exports.remove_html = remove_html;