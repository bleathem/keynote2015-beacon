'use strict';

var Rx = require('rx')
  , RxNode = require('rx-node')
  , convertLocation = require('../api/location/location_controllers').convertLocation
  , ScanLatest = require('../api/scan/scan_model').ScanLatest
  , getUser = require('../api/user/user').getUser
  ;

var tag = 'RESTORE';

var restoreScans = function() {
  return RxNode.fromStream(ScanLatest.find().stream(), 'close')
    .map(function(scanDocument) {
      var scan = scanDocument.toObject();
      scan.user = getUser(scan.beaconId);
      scan.location = convertLocation(scan.locationCode);
      scan.timestamp = new Date(scan.timestamp).getTime();
      scan.retransmit = false;
      return scan;
    });
};

module.exports = {
  restoreScans: restoreScans
};
