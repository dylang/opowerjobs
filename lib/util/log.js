module.exports = log;
module.exports.from = init;

var sys = require("sys");

function init(path) {
    var app_name = path.split('/').pop();
    return function(msg, pref, cb) { log(app_name, msg, pref, cb); };
}

function log(app_name, msg, pref, cb) {
    if (msg instanceof Error) msg = msg.stack || msg.toString();

    pref = pref ? (" \033[35m" + pref + "\033[0m ") : '';

    if (typeof msg !== "string") {
        msg = sys.inspect(msg, 0, 4);
        if (msg.length + pref.length > 80) {
            msg = ("\n" + msg).split(/\n/).join("\n    ");
        }
    }

    if (msg) msg = (app_name ? color(colors.green, app_name) + ' ' : '') + pref + msg;

    sys.error(msg);

    cb && cb()
}

log.er = function (app_name, cb, msg) {
    if (!msg) throw new Error(
            "Why bother logging it if you're not going to print a message?");

    return function (er) {
        if (er) log(app_name, msg, "fail");
        cb.apply(this, arguments)
    }
};

var colors = {
  reset: "\x1B[0m",

  grey:    "\x1B[0;30m",
  red:     "\x1B[0;31m",
  green:   "\x1B[0;32m",
  yellow:  "\x1B[0;33m",
  blue:    "\x1B[0;34m",
  magenta: "\x1B[0;35m",
  cyan:    "\x1B[0;36m",
  white:   "\x1B[0;37m",

  bold: {
    grey:    "\x1B[1;30m",
    red:     "\x1B[1;31m",
    green:   "\x1B[1;32m",
    yellow:  "\x1B[1;33m",
    blue:    "\x1B[1;34m",
    magenta: "\x1B[1;35m",
    cyan:    "\x1B[1;36m",
    white:   "\x1B[1;37m"
  }
};

function color(color, text) {
    return color + text + colors.reset;
}
