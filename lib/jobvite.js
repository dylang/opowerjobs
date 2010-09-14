/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('./util/log').from(__filename),
    request = require('request'),
    xml2js = require('xml2js'),
    Cache = require('./util/cache');

var JOBVITE_XML_FEED = 'http://www.jobvite.com/CompanyJobs/Xml.aspx?c=',
    JOBVITE_COMPANY_ID = 'qgY9Vfw2',
    CACHE_FILENAME = 'jobs';


function download(url, file, callback) {
    log('load from ' + url);

    request({uri: url}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            parseXML(body, callback);
        }
        else {
            log('Trouble loading xml.');
            log(error);
            log(response);
            callback();
        }
    });
}

function parseXML(xml, callback) {
    var x2js = new xml2js.Parser();

    x2js.addListener('end', function(data) {
        var json = JSON.stringify(data);
        callback(json);
    });

    x2js.parseString(xml);
}


function update(callback) {
    reload(callback);
}

function reload(callback, saveFile) {
    download(JOBVITE_XML_FEED + JOBVITE_COMPANY_ID, CACHE_FILENAME, function(data) {
        if (saveFile) {
            log('savefile *****************');
            Cache.save('jobs', data);
        }
        callback && callback(data);
    });
}

function data(){
    return Cache.data(CACHE_FILENAME);
}

exports.data = data;
exports.update = update;
exports.reload = reload;


