/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('../util/log').from(__filename);

function compare(options) {

    var results = [];
    options.before.forEach(function(value, index) {
        if (options.after.indexOf ? options.after.indexOf(value) === -1 : !options.after[index]){
            results.push(options.removed + ': ' + (options.value ? options.value(value) : value))
        }

    });

    options.after.forEach(function(value, index) {
        if (options.before.indexOf ? options.before.indexOf(value) === -1 : !options.before[index]){

            results.push(options.added + ': ' + (options.value ? options.value(value) : value))
        }
        else {
            options.changes && options.changes.forEach(function(changed) {
                var change = changed(options.before[index], value);
                if (change) {
                    results.push('job change: ' + change);
                }
            });

        }
    });


    return results;
}


function changelog(old_data, new_data) {
    if (!old_data || !new_data) { return; }

    var results = [];
    var diff = [];

    // teams
    diff = compare({
        before: old_data.all_teams,
        after: new_data.all_teams,
        added: 'new team',
        removed: 'team gone'});
    diff && diff.length && results.push.apply(results, diff);

    // other job changes
    var title = function(job) { return job.title + ' (' + job.url.location + ', ' + (job.critical ? 'CRITICAL, ' : '') + 'http://opower.jobs/' +  job.id + ')';};
    diff = compare({
        before: old_data.all_ids,
        after: new_data.all_ids,
        value: title,
        added: 'new job',
        removed: 'job removed',
        changes: [
            function(a, b) { if (a.critical && !b.critical) { return 'no longer critical: ' + title(b); }
                             if (!a.critical && b.critical) { return 'now critical: ' + title(b); }
            },
            function(a, b) { if (a.title != b.title) { return 'title changed from ' + a.title + ' to: ' + title(b); } },
            function(a, b) { if (a.description.join('\n') != b.description.join('\n')) { return 'description changed for ' + title(b); /* + '\n' + b.description; */ } }
            ]
        });

    diff && diff.length && results.push.apply(results, diff);

    if (results.length) {
        log('Change Log', new Date());
        results.forEach(function(item) { log('[changelog]', item); });
    }

}


module.exports = changelog;