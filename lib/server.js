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
        exphbs  = require('express-handlebars'),
        hbs = exphbs.create({}),
        compression = require('compression'),
        localtunnel = require('localtunnel'),
        app = express(),
        open = require('open'),
        connectInject = require('connect-inject'),
        publicUrl,
        localUrl;

      // Static assets
      app.use(compression());
      app.enable('view cache');
      app.use('/', connectInject({
        snippet: "<script>console.log('hello world from inject');</script>"
      }), express.static(destinationDirectory, { maxAge: 0 }));

      // The connect page
      app.engine('handlebars', hbs.engine);
      app.set('view engine', 'handlebars');
      app.set('views', path.resolve(__dirname, 'server', 'views'));
      app.use('/connect/assets', express.static(path.resolve(__dirname, 'server', 'assets'), { maxAge: 0 }));
      app.get('/connect', function (req, res) {
        console.log('Connect route for scanner application');
        res.render('connect', {publicUrl: publicUrl, localUrl: localUrl});
      });

      // Let's start the server
      app.listen(port);
      localUrl = 'http://localhost:'+port;
      console.log('cordova-hcp local server available at '+ localUrl);

      // And make it accessible from the internet
      var tunnel = localtunnel(port, function(err, tunnel) {
          if (err) {
            console.log('Could not create localtunnel: ', err);
          }
          publicUrl = tunnel.url;
          console.log('cordova-hcp public server available at '+tunnel.url);
          open(localUrl+'/connect');
      });

      tunnel.on('close', function() {
          console.log('Localtunnel closed.');
      });
  }
})();
