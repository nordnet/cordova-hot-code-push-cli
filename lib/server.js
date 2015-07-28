(function(){
  var path = require('path'),
      argv = require('optimist').argv,
      Q = require('q'),
      _ = require('lodash'),
      fs = require("fs"),
      port = process.env.PORT || 31284,
      weinrePort = process.env.WEINRE_PORT || 31285,
      destinationDirectory = path.join(process.cwd(), '.chcpbuild'),
      watch = require('watch'),
      express = require('express'),
      exphbs  = require('express-handlebars'),
      hbs = exphbs.create({}),
      weinre = require('weinre'),
      compression = require('compression'),
      localtunnel = require('localtunnel'),
      app = express(),
      io,
      build = require('./build.js').execute,
      open = require('open'),
      connectInject = require('connect-inject'),
      localUrl = 'http://localhost:'+port,
      publicUrl,
      connectUrl,
      consoleUrl,
      remoteDebug = !(argv.nodebug);

  var configFile = path.join(process.cwd(), 'chcp.json');
  var ignoreFile = path.join(process.cwd(), '.chcpignore');

  module.exports = {
    execute: execute
  };

  function execute(argv) {
    var executeDfd = Q.defer();

    build().then(function(){
      server();
      executeDfd.resolve();
    });

    return executeDfd.promise;
  }

  function fileChangeFilter(file) {
    // Ignore changes in all files and folder containing .chcp
    // This excludes changes in build directory
    return (file.indexOf('.chcp') === -1);
  }

  function handleFileChange(file) {
    console.log('File changed: ', file);
    build().then(function(config) {
      console.log('Should trigger reload for build: '+config.release);
      io.emit('release', { config: config });
    });
  }

  function server() {
    // If a lot of files changes at the same time, we only want to trigger the change event once.
    handleFileChange = _.debounce(handleFileChange, 500);

    // The connect page
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.set('views', path.resolve(__dirname, 'server', 'views'));
    app.use('/connect/assets', express.static(path.resolve(__dirname, 'server', 'assets'), { maxAge: 0 }));
    app.get('/connect', function (req, res) {
      console.log('Connect route for scanner application');
      res.render('connect', {publicUrl: publicUrl, localUrl: localUrl, consoleUrl: consoleUrl});
    });

    if(remoteDebug) {
      startRemoteDebugging().then(function(debuggingUrl){
        serveStaticAssets(app, debuggingUrl);
      });
    } else {
      serveStaticAssets(app);
    }


    // Let's start the server
    io = require("socket.io")(app.listen(port));

    // Open up socket for file change notifications
    io.on('connection', function(socket){
      console.log('a user connected');
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });

    // Monitor for file changes
    watch.watchTree(process.cwd(), {filter: fileChangeFilter}, function (f, curr, prev) {
      if (typeof f == "object" && prev === null && curr === null) {
        // Finished walking the tree
        console.log('Finished');
      } else {
        handleFileChange(f);
      }
    });

    console.log('cordova-hcp local server available at: '+ localUrl);

    // And make it accessible from the internet
    var tunnel = localtunnel(port, function(err, tunnel) {
        if (err) {
          console.log('Could not create localtunnel: ', err);
        }
        publicUrl = tunnel.url;
        connectUrl = publicUrl+'/connect';
        console.log('cordova-hcp public server available at: '+tunnel.url);
        console.log('Connect your app using QR code at: '+connectUrl);
        if(typeof argv.nobrowser === 'undefined'){
          open(connectUrl);
        }
    });

    tunnel.on('close', function() {
        console.log('Localtunnel closed.');
    });
  }

  function serveStaticAssets(app, debuggingUrl){
    // Disable caches
    console.log('Serve static assets: ', debuggingUrl);
    app.disable('etag');
    app.use(function(req, res, next) {
      req.headers['if-none-match'] = 'no-match-for-this';
      next();
    });
    // Static assets
    app.use(compression());
    app.enable('view cache');
    var snippet = '<script src="/connect/assets/liveupdate.js"></script>';
    if(debuggingUrl) {
      snippet = snippet + '<script src="' + debuggingUrl + '/target/target-script-min.js"></script>';
    }
    console.log('Snippet: ', snippet);

    app.use('/', connectInject({
      snippet: snippet
    }), express.static(destinationDirectory, { maxAge: 0 }));
  }

  function startRemoteDebugging() {
    var dfd = Q.defer(),
        weinreOptions = {
          httpPort: weinrePort,
          boundHost: 'localhost',
          verbose: process.env.WEINRE_VERBOSE || false,
          debug: process.env.WEINRE_DEBUG || false,
          readTimeout: 5,
          deathTimeout: 5
        };

      console.log('Starting weinre for remote debugging');

      weinre.run(weinreOptions);
      //And make it accessible from the internet
      var weinreTunnel = localtunnel(weinrePort, function(err, tunnel) {
          if (err) {
            dfd.reject(err);
            console.log('Could not create localtunnel: ', err);
          }
          consoleUrl = 'http://localhost:' + weinrePort + '/client/#anonymous';
          console.log('Remote debugging available at: ' + consoleUrl);
          dfd.resolve(tunnel.url);
      });

      weinreTunnel.on('close', function() {
          console.log('Remote debugging localtunnel closed.');
      });
    return dfd.promise;
  }
})();
