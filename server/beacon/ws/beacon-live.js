'use strict';

var WebSocketServer = require('ws').Server
  , live = require('../beacon-live')
  , restoreScans = require('../restorescans')
  , Rx = require('rx')
  ;

var tag = 'WS/LIVE';

module.exports = function(server) {
  var wss = new WebSocketServer({server: server, path: '/live'});

  var count = 0;
  var clients = {};

  wss.broadcast = function broadcast(data) {
    for (var i in clients) {
      var ws = clients[i];
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      } else if (ws.readyState === ws.CLOSED) {
        console.log(tag, 'Peer #' + ws.id + ' disconnected from /live.');
        delete clients[ws.id];
      }
    };
  };

  wss.on('connection', function connection(ws) {
    var id = count++;
    clients[id] = ws;
    ws.id = id;
    console.log(tag, 'Starting restore query');
    var scans = restoreScans.restoreScans().share();
    scans.buffer(scans.debounce(5))
      .tap(function(scanBundle) {
        console.log(tag, 'Restoring', scanBundle.length, 'scans');
        // console.log(scanBundle);
        if (ws.readyState === ws.OPEN) {
          clients[id].send(JSON.stringify({type: 'scanBundle', data: scanBundle}));
        } else {
          console.log(tag, 'ws not open, retrying');
          throw new Error({code: 'retry'})
        }
      })
      .retryWhen(function(errors) {
        return errors.scan(0, function(errorCount, err) {
            return errorCount + 1;
        })
        .takeWhile(function(errorCount) {
            return errorCount < 5;
        })
        .flatMap(function(errorCount) {
          return Rx.Observable.timer(50);
        });
      })
      .subscribeOnError(function(err) {
        console.log(err.stack || err);
      });

    console.log(tag, 'Peer #' + id + ' connected to /live.');
  });

  live.scanFeed.tap(function(scan) {
    wss.broadcast(JSON.stringify({type: 'scan', data: scan}));
  }).subscribeOnError(function(err) {
    console.log(err.stack || err);
  });
}
