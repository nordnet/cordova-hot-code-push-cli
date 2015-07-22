(function(){
  var path = require('path'),
      prompt = require('prompt'),
      argv = require('optimist').argv,
      fs = require('fs-extra'),
      async = require('async'),
      crypto = require('crypto'),
      Q = require('q'),
      _ = require('lodash'),
      createHash = require('crypto').createHash,
      recursive = require('recursive-readdir');

  var configFile = path.join(process.cwd(), 'chcp.json');
  var ignoreFile = path.join(process.cwd(), '.chcpignore');

  module.exports = {
    execute: execute
  };

  function execute(argv) {
    var config,
        destinationDirectory = '/tmp/chcp-build',
        projectIgnore = '',
        ignore= [
          'node_modules',
          '.chcpignore',
          '.chcplogin',
          '.gitignore',
          'package.json',
          '.git'
        ];

    try {
      projectIgnore = fs.readFileSync(ignoreFile, {encoding: 'utf-8'});
    } catch(e) {
      console.log('Cannot parse .chcpignore');
    }

    if(projectIgnore.length > 0) {
      console.log('projectIgnore: ', projectIgnore);
      _.assign(ignore, _.trim(projectIgnore).split(/\n/));
      console.log('New ignore:', ignore);
    }

    fs.remove(destinationDirectory);

    recursive(process.cwd(), ignore, function (err, files) {
      //console.log(files);
      var hashQueue = [];
      for(var i in files) {
        var file = files[i];
        var dest = file.replace(process.cwd(), destinationDirectory);
        fs.copySync(file, dest, {clobber:true});
        hashQueue.push(function(callback){
          var filename = file,
              hash = crypto.createHash('md5'),
              stream = fs.createReadStream(filename);

          //console.log('Hashing: ', filename);
          stream.on('data', function (data) {
            hash.update(data, 'utf8');
          });

          stream.on('end', function () {
            var result = hash.digest('hex'),
                file = filename.replace(process.cwd()+'/', '');
            callback(null, {file: file, hash: result});
          });
        });
        // console.log('destinationDirectory: ', destinationDirectory);
        // console.log('File: ', file);
        // console.log('Dest: ', dest);
      }
      async.parallelLimit(hashQueue, 10, function(err, result) {
        //console.log('Hash results: ', result);
        var json = JSON.stringify(result, null, 2);
        var manifestFile = destinationDirectory + '/chcp.manifest';

        fs.writeFile(manifestFile, json, function(err) {
          if(err) {
            return console.log(err);
          }
          console.log('Build created in '+destinationDirectory);
        });
      });
    });
  }
})();
