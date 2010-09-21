/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

var log = require('../util/log').from(__filename),
    fs = require('fs');

function team_pages() {
    var team_pages = {};
    var files = fs.readdirSync('./views/partials/teams/');
    files.map(function(file){
        var filename = file.split('.');
        if (filename[1] == 'ejs') {
            team_pages[filename[0]] = filename[0];
        }
    });
    return team_pages;
}

module.exports.team_pages = team_pages;