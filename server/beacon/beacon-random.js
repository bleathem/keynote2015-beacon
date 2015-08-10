'use strict';

var Rx = require('rx')
  , locations = require('../api/location/location_controllers').locations
  , users = require('../api/user/user.js')
  ;

var START_MINUTES = 7*60 + 50
  , END_MINUTES = 18*60
  ;

var EVENT_DATE = new Date();
// EVENT_DATE.setDate(EVENT_DATE.getDate() - 1); // yesterday
EVENT_DATE.setHours(0,0,0,0); // start of the day
EVENT_DATE = EVENT_DATE.getTime();

// Returns a random integer between min included) and max (excluded)
var getRandom = function (min, max) {
  return Math.random() * (max - min) + min;
};

var getRandomInt = function (min, max) {
  return Math.floor(getRandom(min,max));
};

var getRandomLocation = function(minutes) {
  var random = getRandomInt(0, locations.length);
  return locations[random];
};

var previousScans = {};

var createRandomScan = function (user, minutes) {
  var lastScan = previousScans[user.id];
  var present = !! lastScan;
  var checkedIn = present && lastScan.type === 'check-in';

  var scan;
  if (checkedIn) {
    scan = {
      user: user
    , location: lastScan.location
    , type: 'check-out'
    }
  } else {
    var location = getRandomLocation(minutes);
    var type = (present || minutes > END_MINUTES - 60) ? 'check-out' : 'check-in';
    scan = {
      user: user
    , location: location
    , type: type
    }
  }
  previousScans[user.id] = scan;
  return scan;
}

var counter = Rx.Observable.interval(25)
  .map(function(n) {
    var minutes = START_MINUTES + n; // increment in 1 minute increments
    return {
      n: n
    , minutes: minutes
    , timestamp: EVENT_DATE + minutes * 60 * 1000 // timestamp in ms
    }
  })
  .takeWhile(function(tick) {
    return tick.minutes <= END_MINUTES;
    // return tick.minutes <= START_MINUTES + 20;
  });

var eventLog = {};

var intervalFromEvents = function(events) {
  var stream;
  if (!events || !events.length) {
     stream = Rx.Observable.empty();
  } else {
    stream = Rx.Observable.range(0, events.length).map(function(n) {
      return events[n];
    }).take(events.length);
  }
  return stream;
};

var randomScans = counter.flatMap(function(tick) {
  var scans = [];
  var rush = (tick.minutes + 5) % 60;
  if (rush > 30) { rush = 60 - rush};
  var numEvents = rush < 10 ? 100 - rush : getRandomInt(0,3); // simulate a rush
  for (var n = 0; n < numEvents; n++) {
    var user = users.getUser(getRandomInt(0, 300));
    var scan = createRandomScan(user, tick.minutes);
    var eventTimeOffest = getRandomInt(0, 60).toFixed(4);
    scan.timestamp = tick.timestamp + eventTimeOffest * 1000
    scans.push(scan);
  };
  if (scans.length) {
    var binTime = tick.timestamp;
    eventLog[binTime] = scans;
  }
  return intervalFromEvents(scans);
});

var reset = function() {
  previousScans = {};
};

module.exports = {
    startTimestamp: EVENT_DATE + START_MINUTES * 60 * 1000
  , endTimestamp: EVENT_DATE + END_MINUTES * 60 * 1000
  , reset: reset
  , scans: randomScans
}
