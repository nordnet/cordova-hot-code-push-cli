# Cordova Hot Code Push Plugin CLI client

This is a command line utility for [Cordova Hot Code Push Plugin](#https://github.com/nordnet/cordova-hot-code-push). It will help you with development and deployment of your web project for Cordova application.

Main features are:
- Automatically generate configuration files, required for Hot Code Push plugin (`chcp.json` and `chcp.manifest`).
- Run local server in order to detect any changes you make in your web project and instantly upload them on the devices.
- Deploy your web project on the external servers with the single command.

## Documentation

- [Installation](#installation)
- [How to use](#how-to-use)
- [Init command](#init-command)
- [Build command](#build-command)
  - [Build ignore list](#build-ignore-list)

### Installation

You can install CLI client using `npm` (current stable 0.1):
```sh
npm install chcp-cli
```

It is also possible to install via repo url directly (__unstable__):
```sh
npm install https://github.com/nordnet/cordova-hot-code-push#cordova-hot-code-push-cli-client
```

When you installs Cordova Hot Code Push Plugin - it will prompt you, if it should install `chcp-cli` as well. If you say `yes` - then `npm install` will be executed automatically. If not - you will have to do it later manually (or don't if you'll wish not to).

### How to use

```sh
cordova-hcp <command>
```

Commands list:
- `init` - initialize project parameters, create default `cordova-hcp.json` file.
- `build` - build project files, generate `chcp.json` and `chcp.manifest` files in the `www` folder. Prepare for deployment.
- `server` - run local server that is used for local development process.
- `login` - create login credentials that are used for deployment of project files on the remote server.
- `deploy` - upload project files on the remote server.

All commands should be executed in the root folder of your Cordova project. For example, lets assume you have a Cordova `TestProject` with the following structure:
```
TestProject/
  config.xml
  hooks/
  node_modules/
  platforms/
  plugins/
  www/
```
Then `cordova-hcp` commands should be executed in the `TestProject` folder.

### Init command

### Build command

#### Build ignore list

In order to exclude files from the build you can:

1. Create `.chcpignore` file in the root of your Cordova Project.
2. Add ignored files. For example:
```
node_modules
chcp.json
chcp.manifest
.chcp*
.git*
package.json
```
As a result, on the `build` phase those files are not gonna be added to the `chcp.manifest` file.

### Server command
How to run:
```sh
cordova-hcp server
```

Command is used for local development purpose only. It starts local server that listens for changes inside the `www` folder and sends notification about the new release to the connected users. This way you can develop your application and see results in the real-time.

How it works:

1) Launch server in the project root by executing:
```sh
cordova-hcp server
```

As a result, you will see something like this:
```
Running server
Checking:  /Cordova/TestProject/www
local_url http://localhost:31284
Build 2015.09.07-10.12.25 created in /Cordova/TestProject/www
cordova-hcp local server available at: http://localhost:31284
cordova-hcp public server available at: https://19d5cfa2.ngrok.com
```

2) Launch application on your emulators or test devices:
```sh
cordova run
```

3) When application starts - it connects to the local server via socket. In the servers console window you should see following message:
```sh
a user connected
```

3) Open any file from your `www` folder and do some changes in it. For example, change `index.html` file. As a result, you will see in the servers console:
```
File changed:  /TestProject/www/index.html
Build 2015.09.07-10.12.31 created in /TestProject/www
Should trigger reload for build: 2015.09.07-10.12.31
```

This means that `cordova-hcp` detected your changes, executed `build` command and sent notification via socket to the connected users.

4) On the mobile side plugin captures `new release` event through the socket and loads it from the server.

### Login command



### Deploy command
