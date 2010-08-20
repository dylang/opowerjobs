var log = require('./util/log').from(__filename),
    Cache = require('./util/cache'),
    jobvite_xml_listing = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=',
    jobvite_company_id = 'qgY9Vfw2',
    filename = 'jobs';

function update(callback) {
    log('load_from_jobvite');

    Cache.update(jobvite_xml_listing + jobvite_company_id, filename, function() {
        //done
        callback && callback();
    });
}

function data(){
    return Cache.data(filename);
}

exports.data = data;
exports.update = update;


