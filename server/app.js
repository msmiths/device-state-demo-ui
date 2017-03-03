/**
 * Main application file
 */
'use strict';

/*
 * Set default node environment to development if no NODE_ENV environment
 * variable has been set in Bluemix. 
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var constants = require('constants');
var path = require('path');
var fs = require('fs');
var url = require('url');
var express = require('express');
var proxy = require('express-http-proxy');
var cfenv = require('cfenv');

// Retrieve the configuration for the environment
var config = require('./config/environment');

/*
 * Setup the server to proxy requests that begin with /api/v0002 to the Watson
 * IoT organization configured for the environment.  When running in Bluemix,
 * this should be configured using the WIOT_ORG_ID and WIOT_DOMAIN environment
 * variables.
 */
process.env.WIOT_ORG_ID = process.env.WIOT_ORG_ID || config.WIOT_ORG_ID;
process.env.WIOT_DOMAIN = process.env.WIOT_DOMAIN || config.WIOT_DOMAIN;
var app = express();
app.use('/api/v0002', proxy(process.env.WIOT_ORG_ID + '.' + process.env.WIOT_DOMAIN, {
  https: true,
  forwardPath: function(req, res) {
    return '/api/v0002' + url.parse(req.url).path;
  }}));

/*
 * If the application is running in production in Bluemix then we get TLS for
 * free up to the DataPower instance that is routing the traffic.  This is good
 * enough for demo purposes. 
 */
if (process.env.NODE_ENV === 'production') {
  var server = require('http').createServer(app);
} else {
  /*
   * The application is not running in production.  Use the server key and
   * certificate defined in the configuration for the environment to configure
   * TLS for the server.
   */
  var options = {
    secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
    key: config.SERVER_KEY,
    cert: config.SERVER_CERT
  };
  var server = require('https').createServer(options, app);
}
require('./config/express')(app);
require('./routes')(app);

// Get the application environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Start server
server.listen(appEnv.port, '0.0.0.0', function () {
  console.log('Express server listening on %s, in %s mode ', appEnv.url, app.get('env'));
});

// Expose app
exports = module.exports = app;
