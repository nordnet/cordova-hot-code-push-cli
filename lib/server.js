(function(){
  var path = require('path'),
      argv = require('optimist').argv,
      Q = require('q'),
      _ = require('lodash');

  var configFile = path.join(process.cwd(), 'chcp.json');
  var ignoreFile = path.join(process.cwd(), '.chcpignore');

  module.exports = {
    execute: execute
  };

  function execute(argv) {
    var executeDfd = Q.defer();

    server();

    executeDfd.resolve();
    return executeDfd.promise;
  }

  function server() {
    var path = require('path'),
        fs = require("fs"),
        port = process.env.PORT || 31284,
        destinationDirectory = path.join(process.cwd(), '.chcpbuild'),
        express = require('express'),
        compression = require('compression'),
        oneDay = 86400000,
        app = express();

      app.use(compression());
      app.enable('view cache');
      app.use('/', express.static(destinationDirectory, { maxAge: 0 }));

      app.get('/connect', function (req, res) {
        console.log('Connect route for scanner application');
      });

      app.listen(port);
      console.log('cordova-hcp local server available at http://localhost:'+port+'/');
  }
})();
