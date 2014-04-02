'use strict';

var log = '';
var spawn = require('child_process').spawn;
var test = spawn('node', ['--trace-opt', '--trace-deopt', '--trace-inlining', './benchmark/Response.js', {
    env: process.env
}]);

var MASK_RECOMPILATION = /\[marking ([^\n]+?) (?:[^\n]+?) for recompilation, reason: (hot and stable|not much type info but very hot|small function|[^,]+?), ICs with typeinfo: ([^\]]+?)\]/;
var MASK_OPTIMIZING = /\[optimizing: \]/;

test.stdout.setEncoding('utf8');

test.stdout.on('data', function(data) {
    log += data;
});

test.stdout.on('end', function() {
    var logStack = log.split(/\r\n|\r|\n/);
    var index = 0;
    var length = logStack.length;
    var line;
    var matches;

    while (index < length) {
        line = logStack[index++];
        matches = MASK_RECOMPILATION.exec(line);

        if (matches && matches.length) {
            console.log('Marking %s for recompilation, reason: %s, ICs with typeinfo: %s', matches[1], matches[2], matches[3]);
        }
    }

    console.log(JSON.stringify(logStack));
});

test.stderr.on('data', function(data) {
    console.log('Error: ' + data);
});
