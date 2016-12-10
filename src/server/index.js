/*eslint-disable */

// TODO: add disable public tunnel!

import path from 'path';
import watch from 'watch';
import express from 'express';
import compression from 'compression';
import minimatch from 'minimatch';
import hidefile from 'hidefile';
import build from '../build';
import pify from 'pify';
import _ngrok from 'ngrok';
import utils from '../utils';
import socketIO from 'socket.io';

const ngrok = pify(_ngrok);

const envFile = path.join(process.cwd(), '.chcpenv');
const buildDirectory = path.join(process.cwd(), '.chcpbuild');
const app = express();
const assetPort = process.env.PORT || 31284;
const disablePublicTunnel = process.env.DISABLE_PUBLIC_TUNNEL || false;

let socketWorker;
let chcpContext;
let sourceDirectory;
let ignoredFiles;
let opts = {};

const updateLocalEnv = (localEnv) => {
  localEnv.config_url = localEnv.content_url + '/chcp.json';

  return utils.writeFile(envFile, localEnv).then(_ => localEnv);
}

const publicTunnel = (port) => {
  return ngrok.connect(port)
    .then(url => updateLocalEnv({
      content_url: url
    }))
    .then(localEnv => localEnv.content_url);
};

const execute = (context) => {
  chcpContext = context;
  ignoredFiles = context.ignoredFiles;
  chcpContext.argv.localdev = true;
  sourceDirectory = chcpContext.sourceDirectory;

  return publicTunnel(assetPort).then(url => {
      chcpContext.argv.content_url = content_url;
    })
    .then(assetServer)
    .then(build(chcpContext))
    .then(config => {
      return updateLocalEnv({
        content_url: config.content_url
      });
    })
    .then(contentUrl => console.log(`cordova-hcp public server available at: ${contentUrl}`));
};

const fileChangeFilter = (file) => {
  if (hidefile.isHiddenSync(file)) {
    return false;
  }

  const relativeFilePath = path.relative(chcpContext.sourceDirectory, file);
  const value = ignoredFiles.find(elem => minimatch(relativeFilePath, elem));

  return value !== undefined;
};

const assetServer = () => {
  const localUrl = `http://localhost:${assetPort}`;

  killCaches(app);
  serveStaticAssets(app);
  serveSocketIO(app);
  watchForFileChange();
};

const watchForFileChange = () => {
  console.log(`Checking: ${sourceDirectory}`);

  const opts = {
    filter: fileChangeFilter
  };

  const onWalk = (file, curr, prev) => {
    if (file != 'object' || prev !== null || curr !== null) {
      handleFileChange(file);
    }
  };

  watch.watchTree(sourceDirectory, opts, onWalk);
};

const handleFileChange = file => {
  console.log(`File changed: ${file}`);

  return build(chcpContext).then(config => {
    console.log(`Should trigger realod for build: ${config.release}`);
    socketWorker.emit('release', {
      config: config
    });
  });
};

const serveSocketIO = (app) => {
  const server = app.listen(assetPort);
  socketWorker = socketIO(server);
  socketWorker.on('connection', socket => {
    console.log('user connected');
    socket.on('disconnect', _ => console.log('user disconnected'));
  });
};

// Static assets
const serveStaticAssets = (app) => {
  app.use(compression());
  app.enable('view cache');
  app.use('/', express.static(sourceDirectory, {
    maxAge: 0
  }));
};

// Disable caches
const killCaches = (ass) => {
  app.disable('etag');
  app.use(_ => {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();
  });
};

export default execute;
