'use strict';

var d3demo = d3demo || {};

var retryFunction = function(errors) {
  return errors.scan(0, function(errorCount, err) {
    console.log('Attmepting a re-connect (#' + errorCount + ')');
    return errorCount + 1;
  })
  .takeWhile(function(errorCount) {
    return errorCount < 50;
  })
  .delay(500);
};

d3demo.stomp = (function stompFeed(d3, Rx) {
  var liveSource = Rx.DOM.fromWebSocket(d3demo.config.backend.ws + '/live')
  .retryWhen(retryFunction)
  .map(function(json) {
    return JSON.parse(json.data);
  })
  .share();

  var scan = liveSource.filter(function(data) {
    return data.type === 'scan';
  })
  .map(function(data) {
    return data.data;
  });

  var scans = liveSource.filter(function(data) {
    return data.type === 'scanBundle';
  })
  .flatMap(function(data) {
    return data.data;
  });

  var live = Rx.Observable.merge(scan, scans);

  var openObserverForPlayback = Rx.Observer.create(
    function(open) {
      var days;
      try {
        days = parseInt(d3demo.config.getParameterByName('days'));
      } catch(e) {
        console.log('Error parsing days');
      }
      var hour;
      try {
        hour = parseInt(d3demo.config.getParameterByName('hour'));
      } catch(e) {
        console.log('Error parsing hour');
      }
      var minute;
      try {
        minute = parseInt(d3demo.config.getParameterByName('minute'));
      } catch(e) {
        console.log('Error parsing minute');
      }
      var config = {
        days: days || 1,
        hour: hour || 7,
        minute: minute || 55
      }
      console.log('Replay config', config);

      var ws = open.target;
      ws.send(JSON.stringify({
        type: 'subscribe'
      , data: config
      }));    }
  , function (err) {
      console.log(error);
    }
  );

  var playback = Rx.DOM.fromWebSocket(d3demo.config.backend.ws + '/playback', null, openObserverForPlayback)
  .retryWhen(retryFunction)
  .map(function(json) {
    return JSON.parse(json.data);
  }).share();

  var random = Rx.DOM.fromWebSocket(d3demo.config.backend.ws + '/random')
  .retryWhen(retryFunction)
  .map(function(json) {
    return JSON.parse(json.data);
  }).share();

  return {
    live: live
  , playback: playback
  , random: random
  }
})(d3, Rx);
