'use strict';

var rawfeed = rawfeed || {};

d3demo.layout = (function dataSimulator(d3, Rx) {

  var getParameterByName=  function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  var display = {
    x: Math.max(document.documentElement.clientWidth, window.innerWidth) || 1920
  , y: Math.max(document.documentElement.clientHeight, window.innerHeight) - 4 - 39
  };

  var margin = {top: 50, right: 0, bottom: 0, left: 0};

  var  width = display.x - margin.left - margin.right
   ,  height = display.y - margin.top - margin.bottom;

  var diagram = d3.select('.diagram');

  diagram.style({'top': (height + margin.top - diagram.node().clientHeight) / 4 + 'px' });

  var box0 = document.querySelector('.amq').getBoundingClientRect()
  box0.x0 = box0.left;
  box0.x1 = box0.right;
  box0.y0 = box0.top - margin.top;
  box0.y1 = box0.bottom - margin.top;
  box0.cx = box0.x0 + box0.width  / 2;
  box0.cy = box0.y0 + box0.height / 2;

  var box1 = document.querySelector('.spark .gears').getBoundingClientRect()
  box1.x0 = box1.left;
  box1.x1 = box1.right;
  box1.y0 = box1.top - margin.top;
  box1.y1 = box1.bottom - margin.top;
  box1.cx = box1.x0 + box1.width / 2;
  box1.cy = box1.y0 + box1.height / 2;

  var svg = d3.select('.map').append('svg')
    .attr('width', width)
    .attr('height', height);

  function particleIn() {
    var offset = getRandomInt(0, 100);
    var start = {x: -10, y: 50 + offset * height / 100};
    var particle = svg.insert('circle')
        .datum({position: start, offset: offset})
        .attr('cx', start.x)
        .attr('cy', start.y)
        .attr('r', 20)
        .style('stroke', '#0088ce')
        .style('stroke-opacity', 1);
    particle.transition()
        .duration(1000)
        .ease('linear')
        .attr('cx', box0.x0)
        .attrTween('cy', function(d, i, a) {
          var ease = d3.ease('quad-out');
          var y0 = parseInt(a);
          var y1 = box0.y0 + 40 + y0 / height * 150;
          return function(t) {
            return y0 + ease(t)*(y1-y0);
          };
        })
        .attr('r', 5)
        .style('stroke-opacity', .4)
      .transition()
          .duration(1000)
          .ease('linear')
          .attrTween('cx', function(d, i, a) {
            var offset = 1.5 * d.offset - 125;
            return function(t) {
              var a = 0.80;
              return (box1.x0 - (t-1)*offset - 5) * (a + (1-a) * Math.cos(2*Math.PI*t))
            };
          })
          .attrTween('cy', function(d, i, a) {
            var ease = d3.ease('quad-out');
            var y0 = box0.y1 + 10;
            var y1 = box1.y0 + 20 + 1.5 * d.offset;
            return function(t) {
              return y0 + ease(t)*(y1-y0);
            };
          })
          .attrTween('r', function(d, i, a) {
            return d3.interpolate(5, 5);;
          })
          .styleTween('stroke-opacity', function(d, i, a) {
            return d3.interpolate(.6, .8);
          })
      .remove()
  };

  function particleOut(event) {
    var offset = getRandomInt(0, 100);
    var start = {
      x: box1.x1,
      // y: box1.y1 - offset / 2 - 75
      y: box1.y1 - 100 + 0.8 * (offset - 50)
    }
    svg.insert('circle')
        .datum({event: event, offset: offset})
        .attr('cx', start.x)
        .attr('cy', start.y)
        .attr('r', function(d) {return d.event.retransmit ? 5 : 10;})
        .style('stroke', function(d) {return d.event.retransmit ? 'orange' : d.event.type === 'check-in' ? 'green': '#ce0000';})
        .style('fill', function(d) {return d.event.retransmit ? 'orange' : d.event.type === 'check-in' ? 'green': '#ce0000';})
        .style('stroke-opacity', 1)
      .transition()
          .duration(1000)
          .ease('linear')
          .attrTween('cx', function(d, i, a) {
            var offset = -1.5 * d.offset;
            return function(t) {
              var a = 1.15;
              return (box1.x1 - t*offset) * (a + (1-a) * Math.cos(2*Math.PI*t))
            };
          })
          .attrTween('cy', function(d, i, a) {
            var ease = d3.ease('quad-in');
            var y0 = start.y;
            var y1 = box0.y1;
            return function(t) {
              return y0 + ease(t)*(y1-y0);
            };
          })
          .styleTween('stroke-opacity', function(d, i, a) {
            return d3.interpolate(.8, 1);
          })
          // .attr('r', 1)
      .transition()
          .duration(1000)
          .ease('linear')
          .attrTween('cx', function(d, i, a) {
            var x0 = box0.x1;
            var x1 = width;
            return d3.interpolate(x0, x1);
          })
          .attrTween('cy', function(d, i, a) {
            var ease = d3.ease('quad-out');
            var y0 = box0.cy + 0.2 * (d.offset - 50);
            var y1 = box0.cy + 1.5 * (d.offset - 50);
            return function(t) {
              return y0 + ease(t)*(y1-y0);
            };
          })
          // .attr('r', 1)
          .style('stroke-opacity', 1)
          .remove();
  };

  // Returns a random integer between min included) and max (excluded)
  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  };

  var interval;
  var beaconEventsCount = 0;
  var beaconEventsProcessedCount = 0;

  var feed = Rx.DOM.fromWebSocket(d3demo.config.backend.ws + '/broker')
  .map(function(message) {
    return JSON.parse(message.data);
  }).share();

  feed.filter(function(message) {
    return message.type === 'setup';
  }).tap(function(message) {
    interval = message.data.interval;
  }).take(1)
  .subscribeOnError(function(err) {
    console.log(err);
  });

  var enqueueFeed = feed.filter(function(message) {
    return message.type === 'enqueueCount';
  }).tap(function(message) {
    switch(message.data.topic) {
      case 'beaconEvents':
        beaconEventsCount = message.data.count;
        window.requestAnimationFrame(function() {
          d3.select('.amq-input .count').text(numeral(beaconEventsCount).format('0,0'));
          d3.select('.amq-input .dirty').style({visibility: 'hidden'});
        });
        break;
      case 'beaconEventsProcessed':
        beaconEventsProcessedCount = message.data.count;
        window.requestAnimationFrame(function() {
          d3.select('.amq-output .count').text(numeral(beaconEventsProcessedCount).format('0,0'));
          d3.select('.amq-output .dirty').style({visibility: 'hidden'});
        });
        break;
    };
  });

  var generatePlaybackInterval = function(replayInterval, messageInterval, numEvents) {
    var numIntervals = messageInterval / replayInterval;
    var numPerInterval = numEvents / numIntervals;
    return Rx.Observable.interval(replayInterval).take(numIntervals).flatMap(function() {
      return Rx.Observable.range(0, numPerInterval)
    });
  }

  var beaconEventsFeed = feed.filter(function(message) {
    return message.type === 'beaconEvents'
  }).flatMap(function(message, x) {
    beaconEventsCount += message.data.num;
    // var num = message.data.num;
    var num = Math.min(message.data.num, 400 * message.data.interval / 1000);
    return generatePlaybackInterval(20, message.data.interval, num).map(function() {
      return x;
    });
  })
  .tap(function(x) {
    particleIn();
  })
  .distinctUntilChanged()
  .tap(function() {
    window.requestAnimationFrame(function() {
      d3.select('.amq-input .count').text(numeral(beaconEventsCount).format('0,0'));
    });
  });

  var beaconEventsProcessedFeed = feed.filter(function(message) {
    return message.type === 'beaconEventsProcessed';
  })
  .flatMap(function(message) {
    var playbackInterval = generatePlaybackInterval(20, message.data.interval, message.data.num);
    return Rx.Observable.zip(
      playbackInterval
    , Rx.Observable.from(message.data.messages)
    , function(x, message) {
        return message;
      }
    );
  })
  .tap(function(event) {
    particleOut(event);
    beaconEventsProcessedCount++;
    window.requestAnimationFrame(function() {
      d3.select('.amq-output .count').text(numeral(beaconEventsProcessedCount).format('0,0'));
    });
  });

  var mergedFeed = Rx.Observable.merge(
    enqueueFeed,
    beaconEventsFeed,
    beaconEventsProcessedFeed
  );

  var subscribtion = mergedFeed.subscribeOnError(function(err) {
    console.log(err.stack ? err.stack : err);
  });

  var focus = true;
  var pauseTime = getParameterByName('pauseTime') || 2000;
  if (pauseTime > 0) {
    window.onblur = function() {
      focus = false;
      setTimeout(function() {
        if (!focus) {
          subscribtion.dispose();
          console.log(subscribtion);
          d3.select('#cover').style({visibility: 'visible', opacity: '0.6'});
        };
      }, pauseTime);
    };

    window.onfocus = function() {
      focus = true;
      if (subscribtion.isStopped) {
        subscribtion = mergedFeed.subscribeOnError(function(err) {
          console.log(err.stack ? err.stack : err);
        });
        d3.select('#cover').style({visibility: 'hidden', opacity: '0'});
      };
    };
  };

})(d3, Rx);
