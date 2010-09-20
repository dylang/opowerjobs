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


function download(callback, andSave) {
    var url = JOBVITE_XML_FEED + JOBVITE_COMPANY_ID;

    log('load from ' + url);

    request({uri: url}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var cb = andSave ? function(data) {
                Cache.save(CACHE_FILENAME, JSON.stringify(data));
                callback && callback(data);
            } : callback;
            parseXML(body, cb);
        }
        else {
            log('Trouble loading xml.');
            log(error);
            log(response);
            callback && callback();
        }
    });
}

function parseXML(xml, callback) {
    var x2js = new xml2js.Parser();

    x2js.addListener('end', function(data) {
        callback(data);
    });

    x2js.parseString(xml);
}



function data(){
    return Cache.data(CACHE_FILENAME);
}

exports.data = data;
exports.download = download;


