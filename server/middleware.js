'use strict';

/*
 * MiddleWare for the entire app
*/

var auth = require('basic-auth')
  , config = require('./config')
  ;

module.exports = exports = {
  logError: function (err, req, res, next) {
    if (err) {
      console.error(err);
      return next(err);
    }
    next();
  },

  handleError: function (err, req, res, next) {
    if (err) {
      res.status(500).send(err);
    }
  },

  cors: function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      return next();
    }
  },

  basicAuth: function(req, res, next) {
    var _user = config.get('BASIC_AUTH_USER')
      , _password = config.get('BASIC_AUTH_PASSWORD');
    if (! _user || ! _password || req.path.indexOf('/api') === 0) {
      next();
      return;
    }
    var credentials = auth(req)
    if (!credentials || credentials.name !== _user || credentials.pass !== _password) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="example"'
      });
      res.end();
    } else {
      next();
    }
  }
};
