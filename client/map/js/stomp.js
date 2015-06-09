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

  var playback = Rx.DOM.fromWebSocket(d3demo.config.backend.ws + '/playback')
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
