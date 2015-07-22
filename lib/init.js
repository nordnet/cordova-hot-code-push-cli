(function(){
  var path = require('path'),
      prompt = require('prompt'),
      argv = require('optimist').argv,
      Q = require('q'),
      _ = require('lodash');

  module.exports = {
    execute: execute
  };

  function execute(argv) {
    var schema = {
      properties: {
        name: {
          description: 'Enter project name',
          pattern: /^[a-zA-Z\-0-9]+$/,
          message: 'Name must be only letters, numbers, or dashes',
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
          message: 'Must be one of: us-east-1, us-west-2, us-west-1, eu-west-1, eu-central-1, ap-southeast-1, ap-southeast-2, ap-northeast-1, sa-east-1'
        }
      }
    };
    prompt.override = argv;
    prompt.message = 'Please provide';
    prompt.delimiter = ': ';
    prompt.start();

    prompt.get(schema, function (err, result) {
      console.log('Command-line input received:', result);
    });
  }

  function initializeProject(props) {
    console.log('Initializing project with props: ', props);
  }
})();
