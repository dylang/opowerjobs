/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename),
    Jobs = require('jobvite').Jobs,
    Lean = require('lean'),
    Sort = require('./sort'),
    Util = require('./util');

var options = {
    jobvite_company_id: 'qgY9Vfw2',
    cache_directory: './data'
};

function load(callback) {
    Jobs.config(options)
        .load(function(err, data){
            process(err, data, callback)
        });
}

function reload(callback) {
    Jobs.config(options)
        .reload(function(err, data){
            process(err, data, callback)
        }, false);
}

function format_description(desc) {
    return desc
            .replace(/&nbsp;/g, ' ')            //replace nonbreaking spaces
            .replace(/\s+/g, ' ')               //remove extra spaces
            .replace(/>\s+</g, '><')            //remove spaces between html
            .replace(/>\s+([^\s])/, '>$1')      //remove whitespace after > before characters
            .replace(/<u>/g, '<strike>')
            .replace(/<\/u>/g, '</strike>')
            .replace(/<br \/><br \/>/g, '<br />')
            .replace(/<br \/>\s*<br \/>/g, '<br />')
            .replace(/<strong>/g, '<h4>')
            .replace(/<\/strong>/g, '</h4>')
            .replace(/<\/h4><br \/>/g, '</h4>')
            .replace(/<ul><\/ul>/, '')           //remove empty lists
            .replace(/^<br \/>/g, '')            //remove first br
            .replace(/<br \/>$/g, '');           //remove last br
}

function create_urls(job) {

    var team        = job.team,
        team_url    = Util.url(team),

        title_url   = Util.url(job.title),

        full_url    = ['', Util.url(job.location), team_url, title_url ].join('/'),
        apply_url   = '/apply' + full_url;

    return {
        team:       team_url,
        title:      title_url,
        full_url:   full_url,
        apply:      apply_url
    };
}

function process(err, jobs_array, callback) {
    if (err) {
        callback(err);
        return;
    }

    if (!jobs_array || !jobs_array.length) {
        callback('ERROR - no job array');
        return;
    }

    var DB_Jobs = new Lean(),
        DB_Urls = new Lean(),
        DB_Teams = new Lean();

    //Set up initial array
    jobs_array.forEach(function(job) {

        // location
        job.location_id = Util.url(job.location);
        job.team_id = Util.url(job.team);

        job.description = format_description(job.description);
        if (!DB_Teams.get(job.team_id)) {
            DB_Teams.set(job.team_id, { id: job.team_id, name: job.team});
        }

    });

    jobs_array.forEach(function(job) {

        var urls = create_urls(job);

        if (DB_Urls.get(urls.full_url)) {
            log('Duplicate:', job.id, 'of', DB_Urls.get(urls.full_url), urls.full_url);
            DB_Urls.set(job.id, DB_Urls.get(urls.full_url));
            job.isDuplicate = true;
        } else {
            job.urls = urls;

            // Hash of all urls
            DB_Urls.set(urls.full_url, job.id);
            DB_Urls.set(job.id, job.id);

            // All you need is the job title
            if (!DB_Urls.get('/' + urls.title)) {
                DB_Urls.set(urls.title, job.id);
            }

            job.search_string = Util.search_string(job);
        }
    });

    jobs_array.sort(Sort.by_team);

    jobs_array.forEach(function(job) {
        if (!job.isDuplicate) {
            DB_Jobs.set(job.id, job);
        }
    });

    callback(null, {
        DB_Jobs:    DB_Jobs,
        DB_Urls:    DB_Urls,
        DB_Teams:   DB_Teams
    });
}

module.exports.load = load;
module.exports.reload = reload;
