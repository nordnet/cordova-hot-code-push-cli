'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _recursiveReaddir = require('recursive-readdir');

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

var _hidefile = require('hidefile');

var _hidefile2 = _interopRequireDefault(_hidefile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = (0, _pify2.default)(_fs3.default);

var getInput = function getInput(prompt, props) {
  return new Promise(function (resolve) {
    return prompt.get(props, function (err, result) {
      return resolve(result, err);
    });
  });
};

var readFile = function readFile(file) {
  return fs.readFile(file, 'utf8').then(function (content) {
    return JSON.parse(content);
  });
};

var writeFile = function writeFile(file, content) {
  var str = JSON.stringify(content, null, 2);

  return fs.writeFile(file, str, 'utf8');
};

var nonHiddenFile = function nonHiddenFile(file) {
  return !_hidefile2.default.isHiddenSync(file);
};

var readDir = function readDir(dir, ignoredFiles) {
  return new Promise(function (resolve, reject) {
    (0, _recursiveReaddir2.default)(dir, ignoredFiles, function (err, files) {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  }).then(function (files) {
    return files.filter(nonHiddenFile);
  });
};

exports.default = {
  getInput: getInput,
  readFile: readFile,
  writeFile: writeFile,
  readDir: readDir
};
module.exports = exports['default'];
//# sourceMappingURL=utils.js.map