'use strict';

var cc = require('config-chain')

var autoconfig = function (overrides) {
  var config = cc(overrides).add({
    IP: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0'
  , PORT: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080
  , WS_HOST: process.env.WS_HOST || 'ws://localhost:8080'
  , DB_URL: process.env.OPENSHIFT_MONGODB_DB_URL ? process.env.OPENSHIFT_MONGODB_DB_URL + 'beacon' : process.env.DB_URL || 'mongodb://localhost/beacon'
  , MONGO_ENABLED: process.env.MONGO_ENABLED || true
  , BASIC_AUTH_USER: process.env.BASIC_AUTH_USER || undefined
  , BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD || undefined
  , AMQ_USER: process.env.AMQ_USER || ''
  , AMQ_PASSWORD: process.env.AMQ_PASSWORD || ''
  , STOMP_FEED: process.env.NODE_ENV === 'production' ? '/queue/Consumer.bl_prod.VirtualTopic.beaconEvents_processed' : '/topic/VirtualTopic.beaconEvents_processed'
  , PUSH_ENABLED: process.env.PUSH_ENABLED || false
  , USER_ENDPOINT: process.env.USER_ENDPOINT || 'https://summitdemo-540ty4j5jnfp0dusuik5kldm-rht-summit-prod.mbaas2.rht.feedhenry.com/registration'
  });
  return config;
};

exports = module.exports = autoconfig();
