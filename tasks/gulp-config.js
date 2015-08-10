'use strict';

var _ = require('underscore')
  , rename = require("gulp-rename")
  , config = require('../server/config')
  ;

var opts = {
  paths: {
    server: {
      specs: 'server/**/*.spec.js'
    }
  , data: process.cwd() + '/data'
  }
, lrPort: 35729
, frontend: {
    hostname: 'localhost'
  , port: config.get('PORT')
  }
, backend: {
    ws: config.get('WS_HOST')
  }
};

process.env.PORT = opts.frontend.port;

module.exports = function(gulp, baseOpts) {
  var newOpts = _.extend({}, baseOpts, opts);
  return newOpts;
};
