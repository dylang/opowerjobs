function url(s) {
    s = s || '';
    s = s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/united states/, '')
        .trim()
        .replace(/\s+/g, '-');
    return s;
}

function unurl(str) {
    str = str || '';
    str = remove_html(str);
    return str.replace(/\-/g, ' ');
}

function toArray(object) {
    var keys = Object.keys(object);
    var result = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result.push(object[key]);
    }
    return result;
}

function remove_html(string) {
    return string.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
}

function search_string(job) {
    return remove_html([job.title, job.urls.location, job.urls.team]
            .join(' ')
            .toLocaleLowerCase());
}



module.exports.url = url;
module.exports.unurl = unurl;
module.exports.toArray = toArray;
module.exports.remove_html = remove_html;
module.exports.search_string = search_string;