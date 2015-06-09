'use strict';

var Rx = require('rx')
  , convertLocation = require('../api/location/location_controllers').convertLocation
  , Scan = require('../api/scan/scan_model')
  , getUser = require('../api/user/user').getUser
  ;

var tag = 'RESTORE';

var restoreScans = function() {
  var start = new Date();
  console.log(tag, start);
  console.log(tag, 'Starting restore scan query');
  return Scan.aggregate()
    .sort({'timestamp': -1})
    .group({
      _id: "$beaconId"
    , timestamp: { $first: '$timestamp'}
    , locationCode: {$first: '$locationCode'}
    , type: {$first: '$type'}
    })
    .project({
      beaconId: '$_id'
    , locationCode: 1
    , type: 1
    , timestamp: 1
    })
    .exec()
    .then(function(scans) {
      var end = new Date();
      console.log(tag, end);
      console.log(tag, 'Ending restore scan query');
      console.log(tag, (end.getTime() - start.getTime())/1000, 'seconds elapsed.');
      return scans.map(function(scan) {
        scan.user = getUser(scan.beaconId);
        scan.location = convertLocation(scan.locationCode);
        scan.timestamp = new Date(scan.timestamp).getTime();
        scan.retransmit = false;
        return scan;
      });
    });
};

module.exports = {
  restoreScans: restoreScans
};
