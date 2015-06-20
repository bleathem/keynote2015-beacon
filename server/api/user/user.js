'use strict';

var Rx = require('rx')
  , request = require('request')

var idMap = {};
var users = [];

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
        console.log(tag, 'Retrieved registration users');
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
.map(function(data, index) {
  var user = {
    id: index
  , name: data.fields.showName ? data.fields.name : 'User ' + index
  , beaconId: data.fields.beaconId
  }
  idMap[user.beaconId] = index;
  users.push(user);
})
.tapOnCompleted(function() {
  for (var i = users.length; i < 300; i++) {
    users.push({
      id: i
    , name: 'Firstname' + i + ' Lastname' + i
    });
  };
});

var lastIndex = 0;

var getUser = function(beaconId) {
  if (! (beaconId in idMap)) {
    idMap[beaconId] = lastIndex;
    users[lastIndex].beaconId = beaconId;
    lastIndex++;
  };
  var index = idMap[beaconId];
  return users[index];
};

module.exports = exports = {
  getUsers: function() {
    return users;
  }
, getUser: getUser
, userInit: userInit
};
