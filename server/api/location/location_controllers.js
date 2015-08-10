'use strict';

var locations = [
  { id: 0, x_i: 400, y_i: 400, name: 'Scanner A', code: 'A'}
, { id: 1, x_i: 1000, y_i: 400, name: 'Scanner B', code: 'B'}
, { id: 2, x_i: 400, y_i: 1000, name: 'Scanner C', code: 'C'}
, { id: 3, x_i: 1000, y_i: 1000, name: 'Scanner D', code: 'D'}
];

var tag = 'API/LOCATION';

var locationHashMap = {};
locations.forEach(function(location) {
  locationHashMap[location.code] = location;
});

var convertLocation = function(code) {
  var location = locationHashMap[code];
  if (!location) {
    if (code.lastIndexOf('x')) {
      console.log(tag, 'Exit event leaked through:', code);
    } else {
      console.log(tag, 'Unmapped location code:', code);
    };
  };
  return location;
}

module.exports = exports = {
  getAll: function(req, res, next) {
    res.json(locations);
  }
, getLocation: function(req, res, next) {
    res.json(locations[req.params.id]);
  }
, locations: locations
, convertLocation: convertLocation
};
