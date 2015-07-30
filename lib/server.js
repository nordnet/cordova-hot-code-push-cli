(function(){
  var path = require('path'),
      argv = require('optimist').argv,
      Q = require('q'),
      _ = require('lodash'),
      fs = require("fs"),
      destinationDirectory = path.join(process.cwd(), '.chcpbuild'),
      watch = require('watch'),
      express = require('express'),
      exphbs  = require('express-handlebars'),
      hbs = exphbs.create({}),
      app = express(),
      assetPort = process.env.PORT || 31284,
      compression = require('compression'),
      build = require('./build.js').execute,
      open = require('open'),
      remoteDebug = !(argv.nodebug),
      io,
      opts = {};

  var configFile = path.join(process.cwd(), 'chcp.json');
  var ignoreFile = path.join(process.cwd(), '.chcpignore');

  module.exports = {
    execute: execute
  };

  function startServer(debug){
    var startServerDfd = Q.defer();
    opts = {
      content_url: content_url,
      connect_url: connect_url,
      debug_url: debug.debug_url,
      console_url: debug.console_url
    };

    assetServer(opts).then(function(local_url){
      opts.local_url = local_url;
      build(opts).then(function(config) {
        opts.config = config;
        serveConnectPage(app, opts);
        startServerDfd.resolve(opts);
      }, function(err){
        startServerDfd.reject(err);
      });
    });
    return startServerDfd.promise;
  }

  function execute(argv) {
    var executeDfd = Q.defer();

    var funcs = [];


    funcs.push(function(){
      return publicTunnel(assetPort);
    });

    funcs.push(function(content_url) {
      var dfd = Q.defer();

      opts.content_url = content_url;
      opts.connect_url = content_url + '/connect';

      dfd.resolve();
      return dfd.promise;
    });

    if(remoteDebug) {
      funcs.push(startRemoteDebugging);
    }

    funcs.push(function(debugOpts){
      if(debugOpts){
        opts.debug_url = debugOpts.debug_url;
        opts.console_url = debugOpts.console_url;
      }

      return assetServer(opts);
    });

    funcs.push(function(local_url){
      console.log('local_url', local_url);
      opts.local_url = local_url;
      return build(opts);
    });

    funcs.push(function(config) {
      var dfd = Q.defer();

      opts.config = config;
      serveConnectPage(app, opts);

      dfd.resolve();
      return dfd.promise;
    });

    funcs.push(function(){
      console.log('cordova-hcp local server available at: '+ opts.local_url);
      console.log('cordova-hcp public server available at: ' + opts.content_url);
      console.log('Connect your app using QR code at: ' + opts.connect_url);
      if(typeof argv.nobrowser === 'undefined'){
        open(opts.connect_url);
      }
    });

    return funcs.reduce(Q.when, Q('initial'));
  }

  function fileChangeFilter(file) {
    // Ignore changes in all files and folder containing .chcp
    // This excludes changes in build directory
    return (file.indexOf('.chcp') === -1);
  }

  function assetServer(opts) {
    var serverDfd = Q.defer(),
        localUrl = 'http://localhost:' + assetPort;

    // If a lot of files changes at the same time, we only want to trigger the change event once.
    handleFileChange = _.debounce(handleFileChange, 500);

    try {
      killCaches(app);
      serveStaticAssets(app, opts);
      serveSocketIO(app);
      watchForFileChange();
      serverDfd.resolve(localUrl);
    } catch(err) {
      console.error('assetServer error: ', err);
      serverDfd.reject(err);
    }

    return serverDfd.promise;
  }

  function watchForFileChange(){
    // Monitor for file changes
    watch.watchTree(process.cwd(), {filter: fileChangeFilter}, function (f, curr, prev) {
      if (typeof f == "object" && prev === null && curr === null) {
        // Finished walking the tree
        // console.log('Finished');
      } else {
        handleFileChange(f);
      }
    });
  }

  function handleFileChange(file) {
    console.log('File changed: ', file);
    build(opts).then(function(config) {
      console.log('Should trigger reload for build: '+config.release);
      io.emit('release', { config: config });
    });
  }

  function serveSocketIO(app) {
    // Let's start the server
    io = require("socket.io")(app.listen(assetPort));

    // Open up socket for file change notifications
    //io.set('transports', ['polling']);
    io.on('connection', function(socket){
      console.log('a user connected');
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  }

  function serveConnectPage(app, opts) {
    // The connect page
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.set('views', path.resolve(__dirname, 'server', 'views'));
    app.use('/connect/assets', express.static(path.resolve(__dirname, 'server', 'assets'), { maxAge: 0 }));
    app.get('/connect', function (req, res) {
      console.log('Connect route for scanner application');
      res.render('connect', opts);
    });
  }

  function serveStaticAssets(app, opts) {
    var connectInject = require('connect-inject');

    // Static assets
    app.use(compression());
    app.enable('view cache');
    var snippet = '<script>window.chcpDevServer="' + opts.content_url + '";</script>\n';
    snippet += '<script src="' + opts.content_url + '/socket.io/socket.io.js"></script>\n';
    snippet += '<script src="' + opts.content_url + '/connect/assets/liveupdate.js"></script>\n';
    if(opts.debug_url) {
      snippet += '\n<script src="' + opts.debug_url + '/target/target-script-min.js"></script>';
    }

    app.use('/', connectInject({
      snippet: snippet
    }), express.static(destinationDirectory, { maxAge: 0 }));
  }

  function killCaches(ass) {
    // Disable caches
    app.disable('etag');
    app.use(function(req, res, next) {
      req.headers['if-none-match'] = 'no-match-for-this';
      next();
    });
  }

  function publicTunnel(port){
    var publicTunnelDfd = Q.defer(),
        localtunnel = require('localtunnel');

    // And make it accessible from the internet
    var tunnel = localtunnel(port, function(err, tunnel) {
      if (err) {
        publicTunnelDfd.reject(err);
        return console.log('Could not create localtunnel: ', err);
      }

      publicTunnelDfd.resolve(tunnel.url);
    });

    tunnel.on('close', function() {
        console.log('Localtunnel closed, port: ', port);
    });

    return publicTunnelDfd.promise;
  }

  function startRemoteDebugging() {
    var weinreDfd = Q.defer(),
        weinre = require('weinre'),
        weinrePort = process.env.WEINRE_PORT || 31285,
        weinreOptions = {
          httpPort: weinrePort,
          boundHost: 'localhost',
          verbose: process.env.WEINRE_VERBOSE || false,
          debug: process.env.WEINRE_DEBUG || false,
          readTimeout: 5,
          deathTimeout: 5
        };

    weinre.run(weinreOptions);

    publicTunnel(weinrePort).then(function(debug_url){
      weinreDfd.resolve({debug_url: debug_url, console_url: 'http://localhost:' + weinrePort + '/client/#anonymous'});
    }, function(err){
      weinreDfd.reject(err);
    });

    return weinreDfd.promise;
  }
})();
