/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} value The object to print out
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 * properties of objects.
 */

module.exports = objToHTML;

//var sys = require('sys');

function objToHTML(obj) {
    if (!obj) return;
    var json = inspect(obj, false, false),
        output;

    try {
        var cleanObj = JSON.parse(json);
            output = OLD_jsonToHTML(cleanObj);
        } catch (err) {
            console.log('parsing error');
            output = json;
    }
    return output;
}

function inspect(obj, showHidden, depth) {
    var seen = [];

    function format(value, recurseTimes) {
        // Provide a hook for user-specified inspect functions.
        // Check that value is an object with an inspect function on it
        if (value && typeof value.inspect === 'function' &&
            // Filter out the sys module, it's inspect function is special
            value !== exports &&
            // Also filter out any prototype objects using the circular check.
            !(value.constructor && value.constructor.prototype === value)) {
            return value.inspect(recurseTimes);
        }

        // Primitive types cannot have properties
        switch (typeof value) {
            case 'undefined': return '"[undefined]"';
            case 'string':    return JSON.stringify(value);
            case 'number':    return '' + value;
            case 'boolean':   return '' + value;
        }
        // For some reason typeof null is "object", so special case here.
        if (value === null) {
            return 'null';
        }

        // Look up the keys of the object.
        if (showHidden) {
            var keys = Object.getOwnPropertyNames(value).map(function (key) {
                return '' + key;
            });
        } else {
            var keys = Object.keys(value);
        }

        var visible_keys = Object.keys(value);

        // Functions without properties can be shortcutted.
        if (typeof value === 'function' && keys.length === 0) {
            if (isRegExp(value)) {
                return '' + value;
            } else {
                return '"[Function!]"';
            }
        }

        // Dates without properties can be shortcutted
        if (isDate(value) && keys.length === 0) {
            return '"' + value.toUTCString() + '"';
        }

        var base, type, braces;
        // Determine the object type
        if (isArray(value)) {
            type = 'Array';
            braces = ["[", "]"];
        } else {
            type = 'Object';
            braces = ["{", "}"];
        }

        // Make functions say that they are functions
        if (typeof value === 'function') {
            base = (isRegExp(value)) ? ' ' + value : ' "[Function?]"';
        } else {
            base = "";
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
            base = ' ' + '"' + value.toUTCString() + '"';
        }

        seen.push(value);

        if (keys.length === 0) {
            return braces[0] + base + braces[1];
        }

        if (recurseTimes < 0) {
            if (isRegExp(value)) {
                return '' + value;
            } else {
                return format(value, recurseTimes + 1);
            }
        }

        var output = keys.map(function (key) {
            var name, str;
            if (value.__lookupGetter__) {
                if (value.__lookupGetter__(key)) {
                    if (value.__lookupSetter__(key)) {
                        str = '"[Getter/Setter]"';
                    } else {
                        str = '"[Getter]"';
                    }
                } else {
                    if (value.__lookupSetter__(key)) {
                        str = '"[Setter]"';
                    }
                }
            }
            if (visible_keys.indexOf(key) < 0) {
                name = "[" + key + "]";
            }
            if (!str) {
                if (seen.indexOf(value[key]) < 0) {
                    if (recurseTimes === null) {
                        str = format(value[key]);
                    }
                    else {
                        str = format(value[key], recurseTimes - 1);
                    }
                    if (str.indexOf('\n') > -1) {
                        if (isArray(value)) {
                            str = str.split('\n').map(
                                                     function(line) {
                                                         return '  ' + line;
                                                     }).join('\n').substr(2);
                        }
                        else {
                            str = '\n' + str.split('\n').map(
                                                            function(line) {
                                                                return '   ' + line;
                                                            }).join('\n');
                        }
                    }
                } else {
                    str = '"[Circular]"';
                }
            }
            if (typeof name === 'undefined') {
                if (type === 'Array' && key.match(/^\d+$/)) {
                    return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                    name = name.substr(1, name.length - 2);
                }
                else {
                    name = name.replace(/'/g, "\\'")
                        .replace(/\\"/g, '"')
                        .replace(/(^"|"$)/g, "'");
                }
            }

            return '"' + name + '"' + ": " + str;
        });

        var numLinesEst = 0;
        var length = output.reduce(function(prev, cur) {
            numLinesEst++;
            if (cur.indexOf('\n') >= 0) {
                numLinesEst++;
            }
            return prev + cur.length + 1;
        }, 0);

        if (length > 50) {
            output = braces[0]
                + (base === '' ? '' : base + '\n ')
                + ' '
                + output.join('\n, ')
                + (numLinesEst > 1 ? '\n' : ' ')
                + braces[1]
                ;
        }
        else {
            output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }

        return output;
    }

    return format(obj, (typeof depth === 'undefined' ? 2 : depth));
}



function isArray(ar) {
    return ar instanceof Array
        || Array.isArray(ar)
        || (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
    var s = "" + re;
    return re instanceof RegExp // easy case
        || typeof(re) === "function" // duck-type for context-switching evalcx case
        && re.constructor.name === "RegExp"
        && re.compile
        && re.test
        && re.exec
        && s.match(/^\/.*\/[gim]{0,3}$/);
}


function isDate(d) {
    if (d instanceof Date) return true;
    if (typeof d !== "object") return false;
    var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
    var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
    return JSON.stringify(proto) === JSON.stringify(properties);
}


var pWarning;

exports.p = function () {
    if (!pWarning) {
        pWarning = "sys.p will be removed in future versions of Node. Use sys.puts(sys.inspect()) instead.\n";
        exports.error(pWarning);
    }
    for (var i = 0, len = arguments.length; i < len; ++i) {
        error(exports.inspect(arguments[i]));
    }
};


function pad(n) {
    return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
    var d = new Date();
    return  [ d.getDate()
        , months[d.getMonth()]
        , [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')
    ].join(' ');
}


var circ_check = 0;
function OLD_jsonToHTML(obj) {
    circ_check++;
    var circular_value = "C" + circ_check,
        counter = 0,
        actions = {
            "parse": function (member) {

                if (member !== undefined && member !== null && typeof member == 'object') {
                    if (member.__$ && member.__$[circular_value]) {
                        return '<a href="#circ' + member.__$[circular_value] + '">CIRCULAR: ' + member.__$[circular_value] + '</a>';
                    }
                    counter++;
                    //member.__$ = { a: 1};
                    //member.__$[circular_value] = counter;
                }
                var type = (member == undefined) ? 'null' : member.constructor.name.toLowerCase();

                return '<a name="circ' + counter + '"></a>'
                    + (this[type] ? this[type](member) : this.special(member))
                    + '';
            },

            "function": function(value) {
                return '<pre class="rounded" style="margin-bottom: 4px; padding: 4px; background-color: #111; color: #1e1; max-width: 600px; max-height: 400px; overflow: auto; font-size: smaller; line-height: 1em;"><code>' + value.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre></code>';
            },

            "special": function(value) {
                return this.object(value);
            },

            "null": function (value) {
                return this['value']('null', 'null');
            },
            "array": function (value) {
                var results = [];
                for (var x = 0; x < value.length; x++) {
                    results.push(this['parse'](value[x]));
                }
                return 'Array[ ' + ((results.length > 0) ? '<div>' + results.join(', ') + '</div><div class="clear"></div>' : '') + ' ]';
            },
            "object": function (value) {
                var results = '';
                for (var member in value) {
                    if (member != '__$') {
                        results += '<tr style=""><td style="font-weight: bold; vertical-align: top; padding: 0 20px 0 4px;">'
                            + this['value']('object', member) + '</td><td style="padding: 0 20px 0 4px;">' + this['parse'](value[member]) + '</td></tr>';
                    }
                }
                return ' ' + ((results.length > 0) ? '<table style="border: 1px solid #ccc; margin: 4px;">' + results + '</table>' : '') + ' ';
            },
            "number": function (value) {
                return this['value']('number', value);
            },
            "string": function (value) {
                return this['value']('string', value);
            },
            "boolean": function (value) {
                return this['value']('boolean', value);
            },

            "value": function (type, value) {
                if (/^(http|https):\/\/[^\s]+$/.test(value)) {
                    return this['value'](type, '<a href="' + value + '" target="_blank">' + value + '</a>');
                }
                return '<span class="' + type + '">' + value + '</span>';
            }
        };
    return '<div style="border: 3px solid #33BBCC;" class="rounded">' + actions.parse(obj) + '</div>';
}


//module.exports = jsonToHTML;