'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loginFile = _path2.default.join(process.cwd(), '.chcplogin');

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

var done = function done() {
  console.log('.chcplogin file created. Don\'t forget to add it to your .gitignore.');
};

var execute = function execute(context) {
  _utils2.default.getInput(schema, context.argv).then(function (content) {
    return _utils2.default.writeFile(loginFile, content);
  }).then(done);
};

exports.default = execute;
module.exports = exports['default'];
//# sourceMappingURL=login.js.map