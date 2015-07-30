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
    var executeDfd = Q.defer(),
        config,
        destinationDirectory = path.join(process.cwd(), '.chcpbuild'),
        projectIgnore = '',
        ignore= [
          'node_modules',
          'chcp.json',
          '.chcp*',
          '.gitignore',
          'package.json',
          '.git'
        ];

    try {
      config = fs.readFileSync(configFile, {encoding: 'utf-8'});
      config = JSON.parse(config);
      config.release = process.env.VERSION || calculateTimestamp();
      console.log('Config', config);
    } catch(e) {
      console.log('Cannot parse chcp.json: ', e);
    }

    try {
      projectIgnore = fs.readFileSync(ignoreFile, {encoding: 'utf-8'});
    } catch(e) {
      console.log('Warning: .chcpignore does not exist.');
    }

    if(projectIgnore.length > 0) {
      _.assign(ignore, _.trim(projectIgnore).split(/\n/));
    }

    fs.removeSync(destinationDirectory);

    recursive(process.cwd(), ignore, function (err, files) {
      var hashQueue = [];
      for(var i in files) {
        var file = files[i];
        var dest = file.replace(process.cwd(), destinationDirectory);
        hashQueue.push(hashFile.bind(null, file, dest));
      }

      async.parallelLimit(hashQueue, 10, function(err, result) {
        var json = JSON.stringify(result, null, 2);
        var manifestFile = destinationDirectory + '/chcp.manifest';

        fs.writeFile(manifestFile, json, function(err) {
          if(err) {
            return console.log(err);
          }
          var json = JSON.stringify(config, null, 2);
          fs.writeFile(destinationDirectory + '/chcp.json', json, function(err) {
            if(err) {
              return console.log(err);
            }
            console.log('Build '+config.release+' created in '+destinationDirectory);
            executeDfd.resolve(config);
          });
        });
      });
    });

    return executeDfd.promise;
  }

  function hashFile(filename, dest, callback){
    var hash = crypto.createHash('md5'),
        stream = fs.createReadStream(filename);

    //console.log('Hashing: ', filename);
    stream.on('data', function (data) {
      hash.update(data, 'utf8');
    });

    stream.on('end', function () {
      var result = hash.digest('hex'),
          file = filename.replace(process.cwd()+'/', '');

      fs.copySync(file, dest, {clobber:true});
      callback(null, {file: file, hash: result});
    });
  }

  function calculateTimestamp() {
    var currentdate = new Date();
    return currentdate.getFullYear() + '.' +
      (((currentdate.getMonth() + 1) < 10) ? '0' + (currentdate.getMonth() + 1) : (currentdate.getMonth() + 1)) + '.' +
      ((currentdate.getDate() < 10) ? '0' + currentdate.getDate() : currentdate.getDate()) + '-' +
      ((currentdate.getHours() < 10) ? '0' + currentdate.getHours() : currentdate.getHours()) + '.' +
      ((currentdate.getMinutes() < 10) ? '0' + currentdate.getMinutes() : currentdate.getMinutes()) + '.' +
      ((currentdate.getSeconds() < 10) ? '0' + currentdate.getSeconds() : currentdate.getSeconds());
  }
})();
