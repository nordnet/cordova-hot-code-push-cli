(function(){
  var path = require('path'),
      prompt = require('prompt'),
      build = require('./build.js').execute,
      fs = require('fs'),
      Q = require('q'),
      _ = require('lodash'),
      s3 = require('s3'),
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
        credentials;

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

    // console.log('Credentials: ', credentials);
    // console.log('Config: ', config);

    var client = s3.createClient({
      maxAsyncS3: 20,
      s3RetryCount: 3,
      s3RetryDelay: 1000,
      multipartUploadThreshold: 20971520,
      multipartUploadSize: 15728640,
      s3Options: {
        accessKeyId: credentials.key,
        secretAccessKey: credentials.secret,
        region: config.s3region
      },
    });
    var params = {
      localDir: context.sourceDirectory,
      deleteRemoved: true,
      s3Params: {
        Bucket: config.s3bucket,
        ACL: 'public-read',
        CacheControl: 'no-cache, no-store, must-revalidate',
        Expires: 0
      },
    };

    console.log('Deploy started');
    var uploader = client.uploadDir(params);
    uploader.on('error', function(err) {
      console.error("unable to sync:", err.stack);
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
