/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log         = require('logging').from(__filename),
    Update      = require('./update'),
    Constants   = require('./constants'),
    Util        = require('./util'),
    Sort        = require('./sort'),
    Changelog   = require('./changelog');


var DB_Jobs,
    DB_Urls,
    DB_Teams;

function init(options, callback) {
    options = options || {};

    Update.load(function(err, data) {
        load_complete(err, data);

        if (options.auto_update) {
            auto_reload();
        }
        callback();
    });
}

function load_complete(err, data) {
    var compare;
    if (err) {
        log(err);
    } else {
        if (DB_Teams) {
            var teamChanges = Changelog.teams(DB_Teams, data.DB_Teams),
                jobChanges = Changelog.jobs(DB_Jobs, data.DB_Jobs);
            compare = [ ];
            if (teamChanges && teamChanges.length) {
                compare.push(teamChanges);
                teamChanges.forEach(function(change){
                    log(change.join(' '));
                });
            }
            if (jobChanges && jobChanges.length) {
                compare.push(jobChanges);
                jobChanges.forEach(function(change){
                    log(change.join(' '));
                });
            }

        }

        DB_Jobs     = data.DB_Jobs;
        DB_Urls     = data.DB_Urls;
        DB_Teams    = data.DB_Teams;
    }

    return compare;
}

function group_by_team(db) {
    var hash = {};

    db.forEach(function(job, id) {
        var team_id = job.team_id;
        if (!hash[team_id]) {
            hash[team_id] = {
                id:     job.team_id,
                name:   DB_Teams.get(job.team_id).name,
                jobs:   []
            };
        }
        hash[team_id].jobs.push({
            id:             id,
            title:          job.title,
            location_id:    job.location_id,
            urls:           job.urls
        });
    });

    return Util.toArray(hash);
}

function location(location_id) {
    return group_by_team(DB_Jobs.query({location_id: location_id}));
}

function team_jobs(team_id) {
    //render just one team
    var jobs_sf = query({team_id: team_id, location_id: Constants.LOCATIONS.sf.id }).toArray();
    var jobs_dc = query({team_id: team_id, location_id: Constants.LOCATIONS.va.id }).toArray();

    return {
        name:       team(team_id).name,
        jobs_sf:    jobs_sf,
        jobs_dc:    jobs_dc
    };
}

function query(query) {
    return DB_Jobs.query(query)
}

function job(job_id) {
    job_id = DB_Urls.get(job_id) || job_id;
    return DB_Jobs.get(job_id);
}

function team(team_id) {
    return DB_Teams.get(team_id);
}

function teams() {
    return DB_Teams.toArray();
}

function reload(callback) {
    Update.reload(function(err, data) {
        var changes = load_complete(err, data);
        callback && callback(data, changes);
    })
}

function auto_reload() {
    reload(function() {
        log('next update in', Constants.UPDATE_INTERVAL_MINUTES, 'minutes');
        setTimeout(auto_reload, Constants.UPDATE_INTERVAL_MINUTES * Constants.MILLISECONDS_PER_MINUTE);
    });
}

function newest() {
    return DB_Jobs.toArray().sort(Sort.by_date);
}

function search(query) {
    query = Util.remove_html(query).replace(/[^a-zA-Z]/g, ' ').replace(/\s\s/g, ' ');
    if (!query) { return false; }

    var jobs = [],
        search_array = query.toLowerCase().split(/[\s|\+]/);

    DB_Jobs.forEach(function(job, job_id) {
        if (job.search_string.indexOf(search_array[0]) != -1) {
            jobs.push(job);
        }
    });

    log('search:', query, 'results:', jobs.length);

    return jobs;
}

module.exports.init = init;
module.exports.query = query;
module.exports.location = location;
module.exports.team_jobs = team_jobs;
module.exports.teams = teams;
module.exports.team = team;
module.exports.job = job;
module.exports.search = search;
module.exports.newest = newest;
module.exports.reload = reload;
module.exports.auto_reload = auto_reload;
