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



  module.exports = {
    execute: execute
  };

  function execute(argv) {
    var destinationDirectory = '/tmp/chcp-build',
        ignore= [
          'node_modules',
          '.chcpignore',
          '.chcplogin',
          '.gitignore',
          'package.json',
          '.git'
        ];

    //fs.remove(destinationDirectory);

    recursive(process.cwd(), ignore, function (err, files) {
      console.log(files);
      var hashQueue = [];
      for(var i in files) {
        var file = files[i];
        var dest = file.replace(process.cwd(), destinationDirectory);
        fs.copySync(file, dest, {clobber:true});
        hashQueue.push(function(callback){
          var filename = file,
              hash = crypto.createHash('md5'),
              stream = fs.createReadStream(filename);

          console.log('Hashing: ', filename);
          stream.on('data', function (data) {
            hash.update(data, 'utf8');
          });

          stream.on('end', function () {
            var result = hash.digest('hex'),
                file = filename.replace(process.cwd()+'/', '');
            callback(null, {file: file, hash: result});
          });
        });
        console.log('destinationDirectory: ', destinationDirectory);
        console.log('File: ', file);
        console.log('Dest: ', dest);
      }
      async.parallelLimit(hashQueue, 10, function(err, result) {
        console.log('Hash results: ', result);
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

  function hashFile(filename) {
    var dfd = Q.defer(),
        hash = crypto.createHash('md5'),
        stream = fs.createReadStream(filename);

    stream.on('data', function (data) {
      hash.update(data, 'utf8');
    });

    stream.on('end', function () {
      var result = hash.digest('hex');
      dfd.resolve({file: filename, hash: result});
    });

    return dfd.promise;
  }

})();
