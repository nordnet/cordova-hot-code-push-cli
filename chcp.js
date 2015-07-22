#! /usr/bin/env node
var path = require('path'),
    argv = require('optimist').argv;

var cmd = argv._[0];
switch(cmd) {
  case 'build':
  case 'login':
  case 'init':
    console.log('Running '+cmd);
    var command = require(path.join(__dirname,'lib',cmd+'.js'));
    command.execute(argv);
    break;
  case 'deploy':
    var build = require(path.join(__dirname,'lib','build.js'));
    build.execute(argv).then(function(){
      var command = require(path.join(__dirname,'lib',cmd+'.js'));
      command.execute(argv);
    });
    break;
  default:
    console.log('Should print usage instructions.');
    process.exit(0);
}
