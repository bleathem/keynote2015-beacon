'use strict';

var exec = require('child_process').exec
  , fs = require('fs')
  ;

module.exports = function(gulp, opts) {
  gulp.task('mongo', function (done) {
    try {
      fs.mkdirSync('data');
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
    console.log(opts.paths.data);
    exec('mongod --dbpath ' + opts.paths.data, function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      done();
    });
  });
};
