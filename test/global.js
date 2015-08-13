global.sinon = require('sinon');
global.chai = require("chai");
global.expect = require("chai").expect;
var sinonChai = require("sinon-chai");
var es6promise = require('es6-promise');
es6promise.polyfill();

var Promise = es6promise.Promise;
var originalPromise = Promise;
Promise._setScheduler((flush) => flush());

function MockPromise(func) {
  var status = {
    resolve (data) {
      status.data = data;
      status.resolved = true
    },
    rejected (data) {
      status.data = data;
      status.rejected = true;
    }
  };
  func(status.resolve, status.reject);

  function resolver(data) {
    return {
      then(cb) {
        var tmp = cb(data);
        return resolver(tmp);
      }
    }
  }
  return {
    then(success, fail) {
      if (status.resolved) {
        var val = success(status.data)
        return resolver(val);
      } else {
        fail(status.data)
      }
    }
  }
}

MockPromise.orignalPromise = Promise;
MockPromise.replace = function() {
  global.Promise = MockPromise;
};

MockPromise.restore = function() {
  global.Promise = originalPromise;
}

global.MockPromise = MockPromise;

chai.use(sinonChai);

var Promise = require('es6-promise').Promise;

// I'm not sure why _setScheduler always works so we don't have to use the MockPromise in order to make the test run synch.
Promise._setScheduler((flush) => flush());
global.Promise = Promise;
