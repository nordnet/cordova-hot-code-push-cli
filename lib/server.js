(function(){
  var path = require('path'),
      argv = require('optimist').argv,
      Q = require('q'),
      _ = require('lodash'),
      fs = require("fs"),
      port = process.env.PORT || 31284,
      destinationDirectory = path.join(process.cwd(), '.chcpbuild'),
      watch = require('watch'),
      express = require('express'),
      exphbs  = require('express-handlebars'),
      hbs = exphbs.create({}),
      compression = require('compression'),
      localtunnel = require('localtunnel'),
      app = express(),
      io,
      build = require('./build.js').execute,
      open = require('open'),
      connectInject = require('connect-inject'),
      localUrl = 'http://localhost:'+port,
      publicUrl,
      connectUrl;

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
      handleFileChange = _.debounce(handleFileChange, 500);

      // The connect page
      app.engine('handlebars', hbs.engine);
      app.set('view engine', 'handlebars');
      app.set('views', path.resolve(__dirname, 'server', 'views'));
      app.use('/connect/assets', express.static(path.resolve(__dirname, 'server', 'assets'), { maxAge: 0 }));
      app.get('/connect', function (req, res) {
        console.log('Connect route for scanner application');
        res.render('connect', {publicUrl: publicUrl, localUrl: localUrl});
      });

      // Static assets
      app.use(compression());
      app.enable('view cache');
      app.use('/', connectInject({
        snippet: '<script src="/connect/assets/liveupdate.js"></script>'
      }), express.static(destinationDirectory, { maxAge: 0 }));

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
          // if (prev === null) {
          //   // f is a new file
          //   console.log('New');
          // } else if (curr.nlink === 0) {
          //   // f was removed
          //   console.log('Removed');
          // } else {
          //   console.log('Changed');
          // }
        }
      });

      console.log('cordova-hcp local server available at: '+ localUrl);

      // And make it accessible from the internet
      var tunnel = localtunnel(port, function(err, tunnel) {
          if (err) {
            console.log('Could not create localtunnel: ', err);
          }
          publicUrl = tunnel.url;
          connectUrl = localUrl+'/connect';
          console.log('cordova-hcp public server available at: '+tunnel.url);
          console.log('Connect your app using QR code at: '+tunnel.url);
          if(typeof argv.nobrowser === 'undefined'){
            open(connectUrl);
          }

      });

      tunnel.on('close', function() {
          console.log('Localtunnel closed.');
      });
  }
})();
