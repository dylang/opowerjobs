var log = require('./log').from(__filename);

function pad(n) { return n <10 ? '0' + n : n; }

function createTimeFromString(str) {
    str = str || '000000';
    var seconds = parseInt(str.substr(1, 4), 36) % 86400;
    var hours = Math.floor(seconds/3600);
    var minutes = Math.floor((seconds-(hours*3600))/60);
    seconds = seconds - hours * 3600 - minutes * 60;
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

function ISODateString(d) {
    // used for Atom feed
    // jobvite doesn't provide time when items are added so we fake it using the job id
    return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate())+'T'
        + pad(d.getHours()) + ':'
        + pad(d.getMinutes()) + ':'
        + pad(d.getSeconds())
        + 'Z';
}


module.exports.ISODateString = ISODateString;
module.exports.createTimeFromString = createTimeFromString;