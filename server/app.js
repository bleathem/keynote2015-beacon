'use strict';

var express = require('express')
  , app = express()
  , config = require('./config')
  , router = express.Router()
  , bodyParser = require('body-parser')
  , morgan = require('morgan')
  , middle = require('./middleware')
  , http = require('http')
  , userController = require('./api/user/user_controllers.js')
  , scanController = require('./api/scan/scan_controllers.js')
  , locationController = require('./api/location/location_controllers.js')
  , supportController = require('./api/support/support_controller.js')
  ;

//app config
app.set('port', config.get('PORT'));
app.set('base url', config.get('IP'));
app.use(middle.basicAuth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(middle.cors);
var staticRoot = __dirname + '/../client/src';
app.use(express.static(__dirname + '/../client'));
app.use('/node_modules', express.static(__dirname + '/../node_modules'));
app.use(morgan('dev'));
app.use('/api', router);
app.use(middle.logError);
app.use(middle.handleError);

//routes
router.route('/users').get(userController.getAll);
router.route('/user/:id').get(userController.getUser);

router.route('/scan/:id').get(scanController.getScan);
router.route('/scans/:beaconId').get(scanController.getScans);
router.route('/scans/:beaconId/limit/:limit').get(scanController.getScans);

router.route('/locations').get(locationController.getAll);
router.route('/location/:id').get(locationController.getLocation);

require('./db')(app);

module.exports = exports = app;
