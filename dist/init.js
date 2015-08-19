'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.execute = execute;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

_es6Promise2['default'].polyfill();

var configFile = _path2['default'].join(process.cwd(), 'cordova-hcp.json');

var name = {
  description: 'Enter project name (required)',
  pattern: /^[a-zA-Z\-\s0-9]+$/,
  message: 'Name must be only letters, numbers, space or dashes',
  required: true
};

var s3bucket = {
  description: 'Amazon S3 Bucket name (required for cordova-hcp deploy)',
  pattern: /^[a-zA-Z\-0-9\.]+$/,
  message: 'Name must be only letters, numbers, or dashes'
};

var s3region = {
  description: 'Amazon S3 region (required for chcp deploy)',
  pattern: /^(us-east-1|us-west-2|us-west-1|eu-west-1|eu-central-1|ap-southeast-1|ap-southeast-2|ap-northeast-1|sa-east-1)$/,
  'default': 'us-east-1',
  message: 'Must be one of: us-east-1, us-west-2, us-west-1, eu-west-1, eu-central-1, ap-southeast-1, ap-southeast-2, ap-northeast-1, sa-east-1'
};

var iosIdentifier = {
  description: 'IOS app identifier',
  pattern: /^[a-zA-Z\-0-9\.]+$/
};

var androidIdentifier = {
  description: 'Android app identifier',
  pattern: /^[a-zA-Z\-0-9\.]+$/
};

var update = {
  description: 'Update method (required)',
  pattern: /(start|resume|instant)/,
  required: true,
  message: 'Needs to be one of start, resume or instant',
  'default': 'resume'
};

var schema = {
  properties: {
    name: name,
    s3bucket: s3bucket,
    s3region: s3region,
    ios_identifier: iosIdentifier,
    android_identifier: androidIdentifier,
    update: update
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

function execute(argv) {
  _prompt2['default'].override = argv;
  _prompt2['default'].message = 'Please provide';
  _prompt2['default'].delimiter = ': ';
  _prompt2['default'].start();

  var result = undefined;

  (0, _utils.getInput)(_prompt2['default'], schema).then(validateBucket).then(function (res) {
    return result = res;
  }).then(getUrl).then(function (url) {
    return _lodash2['default'].assign(result, url);
  }).then(function (content) {
    return (0, _utils.writeFile)(configFile, content);
  }).then(done);
}

function validateBucket(result) {
  if (!result.s3bucket) {
    return _lodash2['default'].omit(result, ['s3region', 's3bucket']);
  }

  return result;
}

function getUrl(_ref) {
  var region = _ref.s3region;
  var bucket = _ref.s3bucket;

  if (!bucket) {
    return (0, _utils.getInput)(_prompt2['default'], urlSchema);
  }

  return { content_url: getContentUrl(region, bucket) };
}

function getContentUrl(region, bucket) {
  var url = region === 'us-east-1' ? 's3.amazonaws.com' : 's3-' + region + '.amazonaws.com';
  return 'https://' + url + '/' + bucket;
}

function done(err) {
  if (err) {
    return console.log(err);
  }
  console.log('Project initialized and chcp.json file created.');
  console.log('If you wish to exclude files from being published, specify them in .chcpignore');
  console.log('Before you can push updates you need to run "chcp login" in project directory');
}
//# sourceMappingURL=init.js.map