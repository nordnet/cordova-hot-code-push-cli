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

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var backslashRegexp = new RegExp('\\\\', 'g');

var pathToConfig = function pathToConfig(dir) {
  return _path2.default.join(dir, 'chcp.json');
};

var getConfig = function getConfig(context) {
  return function () {
    var configPath = pathToConfig(context.sourceDirectory);

    return _utils2.default.readFile(configPath).catch(function (_) {
      return {};
    }).then(function (config) {
      config.release = _utils2.default.generateReleaseNumber();
      return config;
    });
  };
};

var generateFileHash = _ramda2.default.curry(function (context, file) {
  var relFilePath = _path2.default.relative(context.sourceDirectory, file).replace(backslashRegexp, "/");
  var hash = _md5File2.default.sync(file);

  return {
    file: relFilePath,
    hash: hash
  };
});

var sortByLocale = function sortByLocale(a, b) {
  return a.file.localeCompare(b.file);
};

var generateHashes = _ramda2.default.curry(function (context, files) {
  return files.map(generateFileHash(context)).sort(sortByLocale);
});

var createManifestFile = _ramda2.default.curry(function (context, hashes) {
  return _utils2.default.writeFile(context.manifestFilePath, hashes);
});

var saveConfig = _ramda2.default.curry(function (context, config) {
  return _utils2.default.writeFile(context.projectsConfigFilePath, config).then(function (_) {
    return config;
  });
});

var done = _ramda2.default.curry(function (context, config) {
  console.log('Build with release version ' + config.release + ' created in ' + context.sourceDirectory);

  return config;
});

var readSourceDir = function readSourceDir(context) {
  return _utils2.default.readDir(context.sourceDirectory, context.ignoredFiles);
};

var execute = function execute(context) {
  return _ramda2.default.pipeP(readSourceDir, generateHashes(context), createManifestFile(context), getConfig(context), saveConfig(context), done(context))(context);
};

exports.default = execute;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map