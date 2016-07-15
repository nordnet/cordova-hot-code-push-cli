'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _app_config = require('./app_config');

var _app_config2 = _interopRequireDefault(_app_config);

var _amazon_config = require('./amazon_config');

var _amazon_config2 = _interopRequireDefault(_amazon_config);

var _ftp_config = require('./ftp_config');

var _ftp_config2 = _interopRequireDefault(_ftp_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var execute = function execute(context) {
  var configType = context.argv._[1];
  var executionResult = void 0;
  if (configType === 'amazon-config') {
    // TBD
  } else if (configType === 'ftp-config') {
    // TBD
  } else {
    executionResult = (0, _app_config2.default)(context);
  }

  return executionResult;
};

exports.default = execute;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map