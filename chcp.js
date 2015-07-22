#! /usr/bin/env node
var path = require('path'),
    argv = require('optimist').argv;

var cmd = argv._[0];
switch(cmd) {
  case 'login':
  case 'init':
    console.log('Running '+cmd);
    var command = require(path.join(__dirname,'lib',cmd+'.js'));
    break;
  default:
    console.log('Should print usage instructions.');
    process.exit(0);
}

command.execute(argv);
