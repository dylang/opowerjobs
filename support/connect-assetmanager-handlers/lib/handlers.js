var fs = require('fs');
var base64_encode = require('base64').encode;
var exec = require('child_process').exec;
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
						console.log(err);
					} else {
						callback(stdout);

						fs.unlink(tmpName, function (err) {
							if (err) {
								console.log(err);
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
	this.replaceImageRefToBase64 = function (root) {
		return function(file, path, index, isLast, callback) {
			var files = file.match(/data-url\(([^)]+)\)/g);

			if (!files) {
				callback(file);
				return;
			}

			file = file.replace(/data-url/g,'url');
			var callIndex = 0;

			var getFiles = function(content) {
				if (callIndex < files.length) {
					var filePath = files[callIndex].replace(/(data-url\(|\))/g,'').replace(/'/g,'');

					fs.readFile(root+filePath, function (err, data) {
						if (err) {
							console.log('Failed: '+root+filePath);
						} else {
							var fileData = data;
							fs.stat(root+filePath, function(err, data) {
								// Keep files under 32KB since IE doesn't like it bigger then that.
								if (data.size < 32768) {
									content = content.replace(
										new RegExp(filePath), 
										'data:image/png;base64,'+base64_encode(fileData)
									);
								}
								getFiles(content);
							});
						}
					});

					callIndex++;
				} else {
					callback(content);
				}
			};
			getFiles(file);
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