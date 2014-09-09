'use strict';
var EventEmitter = require('events').EventEmitter;
var Stat = require('./Stat.js');

var MASK_RECOMPILATION = /\[marking ([^\n]+?) (?:[^\n]+?) for recompilation, reason: (hot and stable|not much type info but very hot|small function|[^,]+?), ICs with typeinfo: ([^\]]+?)\]/;
var MASK_OPTIMIZING = /\[optimizing: \]/;

var STATE_PENDING = 'pending';
var STATE_OPTIMIZING = 'optimizing';

var spawn = require('child_process').spawn;

function Test(path) {
    EventEmitter.call(this);

    this.stat = new Stat();
    this._state = STATE_PENDING;

    this._chank = '';
    this._process = spawn('node', ['--trace-opt', '--trace-deopt', '--trace-inlining', path, {
        env: process.env
    }]);

    this._process.stdout
        .on('data', this._onData.bind(this))
        .on('end', this._onEnd.bind(this))
        .setEncoding(this.encoding);

    this._process.stderr
        .on('data', this._onError.bind(this));

    return this;
}

Test.Stat = Stat;

Test.prototype = new EventEmitter();

Test.prototype.encoding = 'utf8';

Test.prototype._onData = function (data) {
    var index = data.lastIndexOf('\n');

    if (index >= 0) {
        this._chank = data.substr(index);
        this._processingData(this._chank + data.substring(0, index));
    } else {
        this._chank += data;
    }
};

Test.prototype._onEnd = function (data) {
    this._processingData(this._chank + data);
    this._chank = '';
};

Test.prototype._onError = function (error) {
    console.log(error);
};

Test.prototype._processingData = function (data) {
    var logStack = data.split(/\r\n|\r|\n/);
    var index = 0;
    var length = logStack.length;
    var line;
    var matches;
    var state = this._state;

    while (index < length) {
        line = logStack[index++];

        switch (state) {
            case 'pending':

                break;

            case 'optimizing':

                break;
        }

        matches = MASK_RECOMPILATION.exec(line);

        if (matches && matches.length) {
            console.log('Marking %s for recompilation, reason: %s, ICs with typeinfo: %s', matches[1], matches[2], matches[3]);
        }
    }

    console.log(JSON.stringify(logStack));
};

module.exports = Test;
