'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _md5File = require('md5-file');

var _md5File2 = _interopRequireDefault(_md5File);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var backslashRegexp = new RegExp('\\\\', 'g');

var generateReleaseVersionNumber = function generateReleaseVersionNumber() {
  return Math.floor(new Date() / 1000);
};

var getConfig = function getConfig(context) {
  var pathToConfig = _path2.default.join(context.sourceDirectory, 'chcp.json');

  return _utils2.default.readFile(pathToConfig).catch(function (_) {
    return {};
  }).then(function (config) {
    config.release = generateReleaseVersionNumber();
    return config;
  });
};

var generateFileHash = function generateFileHash(file, context) {
  var relFilePath = _path2.default.relative(context.sourceDirectory, file).replace(backslashRegexp, "/");
  var hash = _md5File2.default.sync(file);

  return {
    file: relFilePath,
    hash: hash
  };
};

var sortByLocale = function sortByLocale(a, b) {
  return a.file.localeCompare(b.file);
};

var generateHashes = function generateHashes(files, context) {
  return files.map(function (file) {
    return generateFileHash(file, context);
  }).sort(sortByLocale);
};

var createManifestFile = function createManifestFile(hashes, context) {
  return _utils2.default.writeFile(context.manifestFilePath, hashes);
};

var saveConfig = function saveConfig(config, context) {
  return _utils2.default.writeFile(context.projectsConfigFilePath, config).then(function (_) {
    return config;
  });
};

var done = function done(config, context) {
  console.log('Build with release version ' + config.release + ' created in ' + context.sourceDirectory);

  return config;
};

var readSourceDir = function readSourceDir(context) {
  return _utils2.default.readDir(context.sourceDirectory, context.ignoredFiles);
};

var execute = function execute(context) {
  return readSourceDir(context).then(function (files) {
    return generateHashes(files, context);
  }).then(function (hashes) {
    return createManifestFile(hashes, context);
  }).then(function (_) {
    return getConfig(context);
  }).then(function (config) {
    return saveConfig(config, context);
  }).then(function (config) {
    return done(config, context);
  });
};

exports.default = execute;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map