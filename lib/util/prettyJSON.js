var circ_check = 0;
function jsonToHTML(obj) {
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
                        member.__$ = { a: 1};
                        member.__$[circular_value] = counter;
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
                    var results = '';
                    for (var x = 0; x < value.length; x++) {
                        results += '<div style="display: inline-block; float: left;">' + this['parse'](value[x]) + '</div>';
                    }
                    return 'Array[ ' + ((results.length > 0) ? '<div>' + results + '</div><div class="clear"></div>' : '') + ' ]';
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


module.exports = jsonToHTML;