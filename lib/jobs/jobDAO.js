/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('../util/log').from(__filename),
    jobData, team_pages,
    Format = require('./format'),
    Changelog = require('./changelog'),
    Discover = require('./discover'),
    Jobvite = require('./jobvite');


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

function init(raw_data) {
    raw_data = raw_data || Jobvite.data();

    var new_data = Format.jobData(raw_data);
    Changelog(jobData, new_data);
    jobData = new_data;

    log('init complete', 'total jobs:', Object.keys(jobData.all_ids).length, 'critical:', jobData.all_critical.length);
    return jobData;
}

init(false);
team_pages = Discover.team_pages();

/*
For testing changelog feature
var test = Jobvite.data();
test.job[3].title = "hello!";
test.job[4].description = 'oh you dont say';

init( test );
*/

module.exports.data = function() { return jobData; };
module.exports.search = search;
module.exports.reload = reload;
module.exports.team_pages = team_pages;
