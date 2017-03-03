/**
 * Main application file
 */
'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var constants = require('constants');
var path = require('path');
var fs = require('fs');
var url = require('url');
var proxy = require('express-http-proxy');

//This application uses express as its web server
//for more info, see: http://expressjs.com
var express = require('express');

//cfenv provides access to your Cloud Foundry environment
//for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// Retrieve the configuration for the environment
var config = require('./config/environment');

process.env.SERVER_KEY = process.env.SERVER_KEY || config.SERVER_KEY;
process.env.SERVER_CERT = process.env.SERVER_CERT || config.SERVER_CERT;

// SSL configuration
var options = {
  secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2,
  key: process.env.SERVER_KEY,
  cert: process.env.SERVER_CERT
};

// Setup server
var app = express();
app.use('/api/v0002', proxy('mjk9pl.internetofthings.ibmcloud.com', {
  https: true,
  forwardPath: function(req, res) {
    return '/api/v0002' + url.parse(req.url).path;
  }}));

if (process.env.NODE_ENV === 'production') {
  var server = require('http').createServer(app);
} else {
  var server = require('https').createServer(options, app);
}
require('./config/express')(app);
require('./routes')(app);

//get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Start server
server.listen(appEnv.port, '0.0.0.0', function () {
  console.log('Express server listening on %s, in %s mode ', appEnv.url, app.get('env'));
});

//server.listen(config.port, config.ip, function () {
//  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
//});

// Expose app
exports = module.exports = app;
