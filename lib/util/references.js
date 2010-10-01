/*!
 * OPOWER Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */


// help the IDE learn node.  By no means a complete list.

var __dirname = '', __filename = '';

var require = function(name) { return name};
require.paths = { unshift: function() {} };

var console = {log: function(data) { return data;}};

var module = { exports: {} };


var process = { env: { PORT: 0 } };
