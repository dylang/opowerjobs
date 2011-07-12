/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('logging').from(__filename),
    fs = require('fs');

module.exports = (function () {
    var team_pages = {};
    var files = fs.readdirSync('./views/teams/');
    files.map(function(file){
        var filename = file.split('.');
        if (filename[1] == 'ejs') {
            team_pages[filename[0]] = filename[0];
        }
    });
    return team_pages;
})();

