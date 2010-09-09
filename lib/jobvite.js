/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename),
    request = require('request'),
    xml2js = require('xml2js'),
    Cache = require('./util/cache'),
    jobvite_xml_listing = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=',
    jobvite_company_id = 'qgY9Vfw2',
    filename = 'jobs';


function download(url, file, callback) {
    log('load from ' + url);

    request({uri: url}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            parseXML(body, file, callback);
        }
        else {
            log('Trouble loading xml.');
            log(error);
            log(response);
            callback();
        }
    });
}

function parseXML(xml, file, callback) {
    var x2js = new xml2js.Parser();

    x2js.addListener('end', function(data) {
        var json = JSON.stringify(data);
        callback(json);
    });

    x2js.parseString(xml);
}


function update(callback) {
    reload(callback, true);
}

function reload(callback, saveFile) {
    download(jobvite_xml_listing + jobvite_company_id, filename, function(data) {
        if (saveFile) {
            log('savefile *****************');
            Cache.save('jobs', data);
        }
        callback && callback(data);
    });
}

function data(){
    return Cache.data(filename);
}

exports.data = data;
exports.update = update;
exports.reload = reload;


