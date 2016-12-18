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

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = (0, _pify2.default)(_fs3.default);
var recursive = (0, _pify2.default)(_recursiveReaddir2.default);

var getInput = _ramda2.default.curry(function (schema, argv) {
  _prompt2.default.override = argv;
  _prompt2.default.message = 'Please provide';
  _prompt2.default.delimiter = ': ';
  _prompt2.default.start();

  return (0, _pify2.default)(_prompt2.default).get(schema);
});

var readFile = function readFile(file) {
  return fs.readFile(file, 'utf8').then(JSON.parse);
};

var stringify = function stringify(content) {
  return JSON.stringify(content, null, 2);
};

var writeFile = _ramda2.default.curry(function (file, content) {
  return fs.writeFile(file, stringify(content), 'utf8');
});

var nonHiddenFile = function nonHiddenFile(file) {
  return !_hidefile2.default.isHiddenSync(file);
};

var readDir = function readDir(dir, ignoredFiles) {
  return recursive(dir, ignoredFiles).then(_ramda2.default.filter(nonHiddenFile));
};

var generateReleaseNumber = function generateReleaseNumber() {
  return Math.floor(new Date() / 1000);
};

var lib = {
  getInput: getInput,
  readFile: readFile,
  writeFile: writeFile,
  readDir: readDir,
  generateReleaseNumber: generateReleaseNumber
};

exports.default = lib;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map