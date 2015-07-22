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
          description: 'Enter project name',
          pattern: /^[a-zA-Z\-\s0-9]+$/,
          message: 'Name must be only letters, numbers, space or dashes',
          required: true
        },
        s3bucket: {
          description: 'Amazon S3 Bucket name',
          pattern: /^[a-zA-Z\-0-9]+$/,
          message: 'Name must be only letters, numbers, or dashes',
          required: true
        },
        s3region: {
          description: 'Amazon S3 region',
          pattern: /^(us-east-1|us-west-2|us-west-1|eu-west-1|eu-central-1|ap-southeast-1|ap-southeast-2|ap-northeast-1|sa-east-1)$/,
          default: 'us-east-1',
          message: 'Must be one of: us-east-1, us-west-2, us-west-1, eu-west-1, eu-central-1, ap-southeast-1, ap-southeast-2, ap-northeast-1, sa-east-1',
          required: true
        }
      }
    };

    prompt.override = argv;
    prompt.message = 'Please provide';
    prompt.delimiter = ': ';
    prompt.start();

    prompt.get(schema, function (err, result) {
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
  }
})();
