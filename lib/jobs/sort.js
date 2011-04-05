function by_team(a, b) {
    if (a.team > b.team) return 1;
    if (a.team < b.team) return -1;
    return by_title(a, b);
}

function by_title(a, b) {
    if (a.title > b.title) return 1;
    if (a.title < b.title) return -1;
    return by_location(a, b);
}

function by_location(a, b) {
    if (a.location > b.location) return 1;
    if (a.location < b.location) return -1;
    return 0;
}

function by_date(a, b) {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return by_title(a,b);
}

module.exports.by_team = by_team;
module.exports.by_date = by_date;