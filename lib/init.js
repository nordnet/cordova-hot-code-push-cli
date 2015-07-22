(function(){
  var path = require('path'),
      prompt = require('prompt'),
      argv = require('optimist').argv,
      fs = require('fs'),
      Q = require('q'),
      _ = require('lodash');


  var configFile = path.join(process.cwd(), 'chcp.json');

  module.exports = {
    execute: execute
  };

  function execute(argv) {
    var schema = {
      properties: {
        name: {
          description: 'Enter project name (required)',
          pattern: /^[a-zA-Z\-\s0-9]+$/,
          message: 'Name must be only letters, numbers, space or dashes',
          required: true
        },
        s3bucket: {
          description: 'Amazon S3 Bucket name (required for chcp deploy)',
          pattern: /^[a-zA-Z\-0-9\.]+$/,
          message: 'Name must be only letters, numbers, or dashes'
        },
        s3region: {
          description: 'Amazon S3 region (required for chcp deploy)',
          pattern: /^(us-east-1|us-west-2|us-west-1|eu-west-1|eu-central-1|ap-southeast-1|ap-southeast-2|ap-northeast-1|sa-east-1)$/,
          default: 'us-east-1',
          message: 'Must be one of: us-east-1, us-west-2, us-west-1, eu-west-1, eu-central-1, ap-southeast-1, ap-southeast-2, ap-northeast-1, sa-east-1'
        },
        ios_identifier: {
          description: 'IOS app identifier',
          pattern: /^[a-zA-Z\-0-9\.]+$/
        },
        android_identifier: {
          description: 'Android app identifier',
          pattern: /^[a-zA-Z\-0-9\.]+$/
        },
        update: {
          description: 'Update method (required)',
          pattern: /(start|resume|instant)/,
          required: true,
          message: 'Needs to be one of start, resume or instant',
          default: 'resume'
        }
      }
    };
    var urlSchema = {
      properties: {
        content_url: {
          description: 'Enter full URL to directory where chcp build result will be uploaded',
          message: 'Must supply URL',
          required: true
        }
      }
    };

    //'content_url'

    prompt.override = argv;
    prompt.message = 'Please provide';
    prompt.delimiter = ': ';
    prompt.start();

    prompt.get(schema, function (err, result) {
      // Add some sane defaults
      result.min_native_interface = 1;

      var dfd = Q.defer();

      if(!result.s3bucket) {
        delete result.s3bucket;
        delete result.s3region;
        prompt.get(urlSchema, function(err, urlResult){
          _.assign(result, urlResult);
          dfd.resolve(result);
        });
      } else {
        var url = 'https://';
        if(result.s3region == 'us-east-1') {
          url += 's3.amazonaws.com/';
        } else {
          url += 's3-'+result.s3region+'.amazonaws.com/';
        }
        url += result.s3bucket;

        result.content_url = url;
        dfd.resolve(result);
      }

      dfd.promise.then(function(result){
        var json = JSON.stringify(result, null, 2);
        fs.writeFile(configFile, json, function(err) {
          if(err) {
            return console.log(err);
          }
          console.log('Project initialized and chcp.json file created.');
          console.log('If you wish to exclude files from being published, specify them in .chcpignore');
          console.log('Before you can push updates you need to run "chcp login" in project directory');
        });
      });

    });
  }
})();
