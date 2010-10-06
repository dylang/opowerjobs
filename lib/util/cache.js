var fs = require('fs'),
    log = require('logging').from(__filename),
    cacheDir = './data/';


function save(file, data){
    var jsonFile = cacheDir + file + '.json';
    log('writting json to ' + jsonFile);
    try {
        fs.writeFileSync(jsonFile, data);
    } catch (err) {
        log(err);
    }
}

function data(file) {
    var jsonFile = cacheDir + file + '.json';

    log('reading from cache: ' + jsonFile);
    var json = fs.readFileSync(jsonFile, 'utf8');

    return JSON.parse(json);
}

module.exports.save = save;
module.exports.data = data;