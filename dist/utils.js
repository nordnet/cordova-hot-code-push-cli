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

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = (0, _pify2.default)(_fs3.default);

// const getInput = (prompt, props) => {
//   return new Promise(resolve => prompt.get(props, (err, result) => resolve(result, err)));
// };

var getInput = function getInput(schema, argv) {
  _prompt2.default.override = argv;
  _prompt2.default.message = 'Please provide';
  _prompt2.default.delimiter = ': ';
  _prompt2.default.start();

  return (0, _pify2.default)(_prompt2.default).get(schema);
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