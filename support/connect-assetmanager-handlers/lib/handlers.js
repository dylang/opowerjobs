var sys = require('sys');
var events = require('events');
var fs = require('fs');
var exec = require('child_process').exec;
var request = require('request');
var step = require('step');
module.exports = new handlers();

function handlers()
{
	function yuiOptimize(options, callback) {
		var tmpName = '/tmp/node-optimize-'+Date.now()+Math.floor(Math.random()*1000000000000)+Math.floor(Math.random()*1000000000000)+'.'+options.type;

		fs.writeFile(tmpName, options.file, function (err) {
			if (err) {
				throw err;
			} else {
				exec('java -jar ../deps/yuicompressor-2.4.2.jar --type '+options.type+' '+tmpName, { cwd: __dirname }, function (err, stdout, stderr) {
					if (err) {
						throw err;
					} else {
						callback(stdout);

						fs.unlink(tmpName, function (err) {
							if (err) {
								throw err;
							}
						});
					}
				});
			}
		});
	}
	this.yuiJsOptimize = function (file, path, index, isLast, callback) {
		yuiOptimize({
			'file': file
			, 'type': 'js'
		}, callback);
	};
	this.yuiCssOptimize = function (file, path, index, isLast, callback) {
		yuiOptimize({
			'file': file
			, 'type': 'css'
		}, callback);
	};
	this.fixVendorPrefixes = function (file, path, index, isLast, callback) {
		callback(file.replace(/-vendor-([^:]+): *([^;]+);/g, ' \
			$1: $2;\
			-moz-$1: $2;\
			-webkit-$1: $2;\
			-o-$1: $2;\
			-ms-$1: $2;\
		'));
	};
	this.fixGradients = function (file, path, index, isLast, callback) {
		callback(file.replace(/gradient: *([^_]+)_([^;]+);/g, function(str, c1, c2) {
			var msieC = [];
			[c1, c2].forEach(function (color) {
				if (color.match(/rgba/)) {
					var opacity = Math.floor(parseFloat(color.match(/([0-9]\.?([0-9]+)?)\) *$/)[1]) * 255).toString(16);
					msieC.push('#'+opacity+color.match(/\((.*?)\,(.*?)\,(.*?),/).splice(1).map(function(val) {
						if (val.length === 1) {
							return parseInt(val, 10).toString(16)+parseInt(val, 10).toString(16);
						} else {
							return parseInt(val, 10).toString(16);
						}
					}).join(''));
				} else {
					if (color.length === 4)
					{
						var val = color.replace('#','');
						color = '#'+val+val;
					}
					msieC.push(color);
				}
			});

			var returnString = [
				'background: '+c1+';'
				, 'background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+c1+'), to('+c2+'));'
				, 'background: -moz-linear-gradient(top, '+c1+', '+c2+');'
				, 'filter:  progid:DXImageTransform.Microsoft.gradient(startColorStr=\''+msieC[0]+'\', EndColorStr=\''+msieC[1]+'\');'
				, '-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorStr=\''+msieC[0]+'\', EndColorStr=\''+msieC[1]+'\')";'
			].join('\n');

			return returnString;
		}));
	};
	this.stripDataUrlsPrefix = function (file, path, index, isLast, callback) {
		callback(file.replace(/data-url/ig,'url'));
	};
	this.replaceImageRefToBase64 = function (root, verbose) {
		function injectBase64Data(base64string, filePath, callback) {
			var regex = new RegExp(filePath.replace(/([.?\/])/ig,'\\$1'), 'g');

			if (!base64string || base64string.length > 32768) {
				base64string = filePath;
			} else {
				if (filePath.match(/\.gif/i)) {
					base64string = 'data:image/gif;base64,'+base64string;
				} else if (filePath.match(/\.jpe?g/i)) {
					base64string = 'data:image/jpg;base64,'+base64string;
				} else {
					base64string = 'data:image/png;base64,'+base64string;
				}
			}

			callback({
				'regex': regex
				, 'data': base64string
			});
		}
		function getFileData(filePath, stepCallback) {
			filePath = filePath.replace(/(data-url\(|\))/g,'').replace(/'/g,'');
			if (filePath.match(/^ *http:\/\//i)) {
				var RequestProxy = fs.RequestProxy = function () {
					events.EventEmitter.call(this);
					var body = '';
					this.end = function() {
						fetchCallback(null, body);
					};
					this.write = function(data) {
						body += data.toString('base64');
					};
				};
				sys.inherits(RequestProxy, events.EventEmitter);

				var responseBodyStream = new RequestProxy();
				request({'uri': filePath, 'responseBodyStream': responseBodyStream}, function(){});
			} else {
				fs.readFile(root+filePath, fetchCallback);
			}

			function fetchCallback(err, data) {
				if (err) {
					throw new Error('Failed: '+root+filePath);
					data = null;
				}

				injectBase64Data(data.toString('base64'), filePath, function(content) {
					stepCallback(null, content);
				});
			}
		}
		return function(file, path, index, isLast, callback) {
			var files = file.match(/data-url\(([^)]+)\)/g);

			if (!files) {
				callback(file);
				return;
			}

			file = file.replace(/data-url/g,'url');

			step(function () {
				var group = this.group();

				files.forEach(function (filePath) {
					getFileData(filePath, group());
				});
			}, function (err, contents) {
				if (err) {
					throw err;
				}
				contents.forEach(function (imageData) {
					file = file.replace(imageData.regex, imageData.data);
				});
				if (verbose) {
					console.log('Finished generating: '+path);
				}
				callback(file);
			});
		};
	};
	this.fixFloatDoubleMargin = function (file, path, index, isLast, callback) {
		callback(file.replace(/(\{.*?float.*?)\}/g, function(str) {
			if(!str.match(/display/i)) {
				return str.replace(/\}$/, 'display: inline;}');
			} else {
				return str;
			}
		}));
	};
}