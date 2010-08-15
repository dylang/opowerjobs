var request = require('request'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    log = require('./log').from(__filename),
    cacheDir = './data/';

    function update(url, file, callback) {
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
        var x2js = new xml2js.Parser(),
            xmlFile = cacheDir + file + '.xml',
            jsonFile = cacheDir + file + '.json';

        log('writting xml to ' + xmlFile);
        fs.writeFileSync(xmlFile, xml);

        x2js.addListener('end', function(data) {
            log('writting json to ' + jsonFile);
            fs.writeFileSync(jsonFile, JSON.stringify(data));
            callback();
        });

        x2js.parseString(xml);
    }

    function data(file) {
        var jsonFile = cacheDir + file + '.json';

        log('reading from cache: ' + jsonFile);
        var json = fs.readFileSync(jsonFile, 'utf8');

        return JSON.parse(json);
    }

module.exports.update = update;
module.exports.data = data;