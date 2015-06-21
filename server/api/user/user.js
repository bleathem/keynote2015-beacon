'use strict';

var Rx = require('rx')
  , request = require('request')
  , _ = require('underscore')

var users = _.range(0, 326).map(function(index) {
  return {
    id: index
  , beaconId: index
  , name: ''
  }
})

var tag = 'USER';

var userInit = Rx.Observable.create(function (observer) {
  console.log(tag, 'Getting registration users');
  request.get({
    url: process.env.NODE_ENV === 'production'
      ? 'https://summitdemo-540ty4j5jnfp0dusuik5kldm-rht-summit-prod.mbaas2.rht.feedhenry.com/registration'
      : 'https://summitdemo-540ty4j5jnfp0dusuik5kldm-rht-summit-dev.mbaas2.rht.feedhenry.com/registration'
  , timeout: 20000
  }
  , function (err, res, body) {
      var enqueueCount;
      if (res && res.statusCode === 200 && body) {
        observer.onNext(JSON.parse(body));
        observer.onCompleted();
      } else {
        var msg = 'Error: ';
        if (res && res.statusCode) {
          msg += res.statusCode;
        }
        console.log(tag, msg);
        console.log(tag, 'err', err);
        console.log(tag, 'res code', res.statusCode);
        console.log(tag, 'body', body);
        msg += err;
        observer.onError(msg);
      }
    });
})
.retryWhen(function(errors) {
  return errors.delay(2000);
})
.flatMap(function(array) {
  return array;
})
.map(function(data) {
  var beaconId = data.fields.beaconId;
  try {
    users[beaconId].name = data.fields.showName ? data.fields.name : 'Beacon ' + beaconId;
  } catch(error) {
    console.log('Unknown beaconId', beaconId);
  }
})
.tapOnCompleted(function() {
  console.log('Users updated');
});

Rx.Observable.interval(20000).flatMap(function() {
  return userInit;
}).subscribeOnError(function(error) {
  console.log(error);
});

var getUser = function(beaconId) {
  return users[beaconId] || {
    id: beaconId
  , beaconId: beaconId
  , name: ''
  };
};

module.exports = exports = {
  getUser: getUser
, userInit: userInit
};
