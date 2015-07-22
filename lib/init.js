(function(){
  var path = require('path'),
      prompt = require('prompt'),
      argv = require('optimist').argv;

  module.exports = {
    execute: execute
  };

  function execute(argv){
    console.log('Init argv: ', argv);
  }

})();
