#!/usr/bin/env node

var fs = require('fs'),
    exec = require('child_process').exec;

function min() {
    var a = 'uglifyjs ../scrollbar.js \
        -o jquery.scrollbar.js \
        -c \
        -m \
        --comments "/Ivan Yan/" \
        ';
    exec(a, function(error, stdout, stderr) {
            if (error !== null) {
                console.log(error);
            } else {
                console.log('done');
            }
        });
}

min();
