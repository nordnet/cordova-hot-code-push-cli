'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();
var IGNORED_FILES_CONFIG_PATH = _path2.default.join(cwd, '.chcpignore');
var DEFAULT_WWW_FOLDER = _path2.default.join(cwd, 'www');
var DEFAULT_CLI_CONFIG = _path2.default.join(cwd, 'cordova-hcp.json');
var DEFAULT_IGNORE_LIST = ['.DS_Store', 'node_modules/*', 'node_modules\\*', 'chcp.json', 'chcp.manifest', '.chcp*', '.gitignore', '.gitkeep', '.git', 'package.json'];
var CHCP_MANIFEST_FILE_NAME = 'chcp.manifest';
var CHCP_CONFIG_FILE_NAME = 'chcp.json';

var sourcesDirectory = function sourcesDirectory(argv) {
  var consoleArgs = argv._;
  if (!consoleArgs || consoleArgs.length !== 2) {
    return DEFAULT_WWW_FOLDER;
  }

  return _path2.default.join(cwd, consoleArgs[1]);
};

var ignoredFiles = function ignoredFiles() {
  return readIgnoredFilesProjectConfig(IGNORED_FILES_CONFIG_PATH).concat(DEFAULT_IGNORE_LIST).filter(noComments);
};

var noComments = function noComments(item) {
  return item.trim().length > 0 && item.indexOf('#') !== 0;
};

var readIgnoredFilesProjectConfig = function readIgnoredFilesProjectConfig(pathToConfig) {
  try {
    return _fs2.default.readFileSync(pathToConfig, 'utf8').trim().split(/\n/);
  } catch (e) {
    return [];
  }
};

var context = function context(argv) {
  var args = argv || {};
  var wwwDir = sourcesDirectory(args);
  var manifestFilePath = _path2.default.join(wwwDir, CHCP_MANIFEST_FILE_NAME);
  var projectsConfigFilePath = _path2.default.join(wwwDir, CHCP_CONFIG_FILE_NAME);

  return {
    argv: args,
    defaultConfig: DEFAULT_CLI_CONFIG,
    sourceDirectory: wwwDir,
    manifestFilePath: manifestFilePath,
    projectsConfigFilePath: projectsConfigFilePath,
    ignoredFiles: ignoredFiles()
  };
};

exports.default = context;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map