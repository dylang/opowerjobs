/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename);

function compare(options) {

    var results = [];
    options.before.forEach(function(value, index) {
        if (!options.after.get(index)){
            results.push( [options.removed + ':'].concat(options.value ? options.value(value)  : value));
        }
    });

    options.after.forEach(function(value, index) {
        if (!options.before.get(index)){
            results.push( [options.added + ':'].concat(options.value ? options.value(value)  : value) );
        }
        else {
            options.changes && options.changes.forEach(function(changed) {
                var change = changed(options.before.get(index), value);
                if (change) {
                    results.push(change);
                }
            });
        }
    });

    return results;
}

function teams(old_data, new_data) {
    if (!old_data || !new_data) { return false; }

    // teams
    return compare({
        before: old_data,
        after: new_data,
        added: 'New Team',
        removed: 'Team Removed'});
}

function jobs(old_data, new_data) {
    if (!old_data || !new_data) { return false; }

    // other job changes
    var format = function(job) { return [job.title, '/' +  job.id];};
    return compare({
        before: old_data,
        after: new_data,
        value: format,
        added: 'New',
        removed: 'Removed',
        changes: [
            function(a, b) { if (a.title != b.title) { return ['Title Changed from:', a.title, 'to:'].concat(format(b)); } },
            function(a, b) { if (a.description != b.description) { return ['Description Updated:'].concat(format(b)); } }
            ]
        });
}
module.exports.teams = teams;
module.exports.jobs = jobs;