'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.execute = execute;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('./utils');

var configFile = _path2['default'].join(process.cwd(), 'cordova-hcp.json');
var loginFile = _path2['default'].join(process.cwd(), '.chcplogin');

var schema = {
  properties: {
    key: {
      description: 'Amazon Access Key Id',
      message: 'You need to provide the Amazon Access Key Id',
      required: true
    },
    secret: {
      description: 'Amazon Secret Access Key',
      message: 'You need to provide the Secret Access Key',
      required: true
    }
  }
};

function execute(context) {
  validateConfig();

  _prompt2['default'].override = context.argv;
  _prompt2['default'].message = 'Please provide';
  _prompt2['default'].delimiter = ': ';
  _prompt2['default'].start();

  (0, _utils.getInput)(_prompt2['default'], schema).then(function (content) {
    return (0, _utils.writeFile)(loginFile, content);
  }).then(done);
}

function validateConfig() {
  var config = undefined;

  try {
    config = _fs2['default'].readFileSync(configFile);
  } catch (e) {
    console.log('Cannot parse cordova-hcp.json. Did you run cordova-hcp init?');
    process.exit(0);
  }

  if (!config) {
    console.log('You need to run "cordova-hcp init" before you can run "cordova-hcp login".');
    console.log('Both commands needs to be invoked in the root of the project directory.');
    process.exit(0); // eslint-disable-line no-process-exit
  }
}

function done(err) {
  if (err) {
    return console.log(err);
  }

  console.log('Project initialized and .chcindex.plogin file created.');
  console.log('You SHOULD add .chcplogin to your .gitignore');
  console.log('( echo \'.chcplogin\' >> .gitignore )');
}
//# sourceMappingURL=login.js.map