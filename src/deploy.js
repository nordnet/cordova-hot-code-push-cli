(function(){
  var path = require('path'),
      prompt = require('prompt'),
      build = require('./build.js').execute,
      fs = require('fs'),
      Q = require('q'),
      _ = require('lodash'),
      s3sync = require('s3-sync-aws'),
      readdirp = require('readdirp'),
      loginFile = path.join(process.cwd(), '.chcplogin');

  module.exports = {
    execute: execute
  };

  function execute(context) {
    var executeDfd = Q.defer();

    build(context).then(function(){
      deploy(context).then(function(){
        executeDfd.resolve();
      });
    });

    return executeDfd.promise;
  }

  function deploy(context) {
    var executeDfd = Q.defer(),
        config,
        credentials,
        ignore = context.ignoredFiles();

    try {
      config = fs.readFileSync(context.defaultConfig, 'utf-8');
      config = JSON.parse(config);
    } catch(e) {
      console.log('Cannot parse cordova-hcp.json. Did you run cordova-hcp init?');
      process.exit(0);
    }
    if(!config) {
      console.log('You need to run "cordova-hcp init" before you can run "cordova-hcp login".');
      console.log('Both commands needs to be invoked in the root of the project directory.');
      process.exit(0);
    }
    try {
      credentials = fs.readFileSync(loginFile, 'utf-8');
      credentials = JSON.parse(credentials);
    } catch(e) {
      console.log('Cannot parse .chcplogin: ', e);
    }
    if(!credentials) {
      console.log('You need to run "cordova-hcp login" before you can run "cordova-hcp deploy".');
      process.exit(0);
    }

    ignore = ignore.map( ignoredFile => `!${ignoredFile}` )

    // console.log('Credentials: ', credentials);
    // console.log('Config: ', config);
    // console.log('Ignore: ', ignore);

    var files = readdirp({
      root: context.sourceDirectory,
      fileFilter: ignore
    });

    var uploader = s3sync({
      key: credentials.key,
      secret: credentials.secret,
      region: config.s3region,
      bucket: config.s3bucket,
      acl: 'public-read',
      headers: {
        CacheControl: 'no-cache, no-store, must-revalidate',
        Expires: 0
      },
      concurrency: 20
    }).on('data', function(file) {
      if (file.fresh) {
        console.log("Updated " + file.fullPath + ' -> ' + file.url)
      }
    });

    files.pipe(uploader);

    console.log('Deploy started');
    uploader.on('error', function(err) {
      console.error("unable to sync:", err.stack);
      executeDfd.reject();
    });
    uploader.on('fail', function(err) {
      console.error("unable to sync:", err);
      executeDfd.reject();
    });

    //uploader.on('progress', function() {
    //  var progress = uploader.progressTotal - uploader.progressAmount;
    //  console.log("progress", progress, uploader.progressTotal, uploader.progressAmount);
    //});
    uploader.on('end', function() {
      console.log("Deploy done");
      executeDfd.resolve();
    });
    return executeDfd.promise;
  }
})();
