var sys = require('sys'),
  fs = require('fs'),
  child_process = require('child_process'),
  spawn = child_process.spawn,
  exec = child_process.exec,
  path = require('path'),
  stdin = process.openStdin(),
  args = parse(process.argv),
  intro = args.intro,
  dir = args.dir,
  test = args.test;
  
// Run the tests in parallel
if(test) {
  if(test === true) {
    fs.stat('test', function(err, stats) {
      if(err || !stats.isDirectory()) {
        test = 'test.js';
      } else {
        test = 'test/test.js';
      }
      startTest(test);
    });
  } else {
    startTest(test);
  }
}
  
playlist(intro, function(err, list) {
  if(err) throw err;
  if(!list.length) throw new Error("No files in the playlist.");
  say('"Party time!" Press [enter] anytime to restart');
  var playing = play(intro);
  
  // Watch changes on any files of the playlist
  list.forEach(function(file) {
      fs.watchFile(file, {interval : 500}, function(curr, prev) {
      if (curr.mtime.valueOf() != prev.mtime.valueOf() || curr.ctime.valueOf() != prev.ctime.valueOf()) {
        say("playlist updated: " + file);
        stop(playing, intro);
        playing = play(intro);
      }
    });
  });
  
  // Listen for commands
  stdin.setEncoding('utf8');
  stdin.addListener('data', function (chunk) {
    switch(chunk) {
      case '\n':
        say("restarting playlist");
        stop(playing, intro);
        startTest(test);
        playing = play(intro);
        break;
    }
  });
  
  function play(intro) {
    var playing = spawn('node', [intro]);
    playing.stdout.addListener('data', function(data) {
      sys.print(data);
    });
    playing.stderr.addListener('data', function(data) {
      sys.print(data);
    });
    return playing;
  }
  function stop(playing, intro) {
    if(playing && playing.pid) {
      playing.kill();
    }
  }
});

function playlist(file, callback) {
  var directory = path.dirname(file);
    // Add potentially missing extension
  if(file && !file.match(/\.js$/)) { file+= '.js'; }
  fs.readFile(file, function(err, data) {
    if(err) {
      if(file) say('"Can\'t get my hands on '+ intro +'"');
      return callback.apply(global, [null, []]);
    }

    // We are using hashs to collect lists of _unique_ files
    var list = {}, deps = {},
      depsNb, i, read = 0;

    // Add the current file
    list[file] = true;

    // Search dependencies of that file
    while(match = /(?:^|[^\w-])require *\(\s*['"](\.\/|\.\.|\/)(.*?)['"]\s*\)/g.exec(data)) {
      deps[path.join(match[1] == '/'? '' : directory , (match[1] != "./"? match[1] : '') + match[2] + '.js')] = true;
    }
    deps = Object.keys(deps);
    
    i = depsNb = deps.length;
    // Make sure that the dependency exists and recursively search its dependencies;
    do {
      playlist(deps[--i] || '', function(err, _list) {
        if(err) throw err;
        // Add dependencies to the list
        _list.forEach(function(value) {
          list[value] = true;
        });
        // Return list when the last file has been inspected
        if(++read >= depsNb) {
          callback.apply(global, [null, Object.keys(list)]);
        }
      });
    } while(i > 0);
  });
}

function parse(argv) {
  var intro, dIndex, dir, tIndex, test;
  
  dIndex = argv.indexOf('-d');
  if(dIndex == -1) { dIndex = argv.indexOf('--dir'); }
  if(dIndex != -1) { dir = argv[dIndex +1]; }
  
  tIndex = argv.indexOf('-t');
  if(tIndex == -1) { tIndex = argv.indexOf('--test'); }
  if(tIndex != -1) { test = tIndex +1 == dIndex? true : argv[tIndex +1] || true; }
  
  intro = (dIndex == 2 || tIndex == 2)? false : argv[2]; 
  
  // Add potentially missing extension
  intro = intro? intro + (intro.match(/\.js$/)? '' : '.js') : 'app.js';
  
  return {
    intro: intro,
    dir: dir,
    test: test
  }
}

function startTest(test) {
  if(test) {
    fs.stat(test, function(err, stats) {
      if(err || !stats.isFile()) {
        say("Test file not found");
      } else {
        // We'll buffer the output, to minimize noise
        exec("node "+test, function(err, stdout, stderr) {
          sys.puts("=============== Tests ===============");
            _print("------------ Exec Errors ------------", err);
            _print("--------------- stdout --------------", stdout);
            _print("--------------- stderr --------------", stderr);
          sys.puts("============= Tests End =============");
          
          function _print(header, data) {
            if(data) {
              sys.puts(header);
              sys.print(typeof data == 'string'? data : data.toString('utf8', 0, data.length));
            }
          }
        });
      }
    });
  }
}

say = function(message) {
  sys.puts('DJs: '+message);
}

exports.playlist = playlist;

exports.parse = parse;