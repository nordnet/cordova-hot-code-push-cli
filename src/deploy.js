(function(){
  var path = require('path'),
      prompt = require('prompt'),
      build = require('./build.js').execute,
      fs = require('fs'),
      Q = require('q'),
      _ = require('lodash'),
      s3 = require('s3'),
      FtpClient = require('ftp-client'),
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
    var config,
        loginInfo;

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
      loginInfo = fs.readFileSync(loginFile, 'utf-8');
      loginInfo = JSON.parse(loginInfo);
    } catch(e) {
      console.log('Cannot parse .chcplogin: ', e);
    }
    if(!loginInfo) {
      console.log('You need to run "cordova-hcp login" before you can run "cordova-hcp deploy".');
      process.exit(0);
    }

    // console.log('LoginInfo: ', loginInfo);
    // console.log('Config: ', config);
    switch (loginInfo.pushMode) {
      case 'ftp':
        return uploadToFTP(context, config, loginInfo.ftp);
      case 's3':
        return uploadToS3(context, config, loginInfo.s3);
      default:
        throw new Error('unsupported push mode.');
    }
  }

  function uploadToS3(context, config, credentials) {
    var executeDfd = Q.defer();
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

  function uploadToFTP(context, config, ftpConfig) {
    const client = new FtpClient({
        host: ftpConfig.host,
        port: ftpConfig.port,
        user: ftpConfig.username,
        password: ftpConfig.password
    }, {
      logging: 'basic'
    });

    const executeDfd = Q.defer();

    client.connect(function () {
        client.upload(`${context.sourceDirectory}/**`, ftpConfig.path, {
            baseDir: context.sourceDirectory,
            overwrite: 'all'
        }, function (result) {
            if (!_.isEmpty(result.errors)) {
                console.error('Some files could not be uploaded: ', result.errors);
                return executeDfd.reject();
            }
            executeDfd.resolve();
        });
    });
    return executeDfd;
  }
})();
