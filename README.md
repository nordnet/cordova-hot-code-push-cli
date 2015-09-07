# Cordova Hot Code Push Plugin CLI client

This is a command line utility for [Cordova Hot Code Push Plugin](#https://github.com/nordnet/cordova-hot-code-push). It will help you with development and deployment of your web project for Cordova application.

Main features are:
- Automatically generate configuration files, required for Hot Code Push plugin (`chcp.json` and `chcp.manifest`).
- Run local server in order to detect any changes you make in your web project and instantly upload them on the devices.
- Deploy your web project on the external servers with the single command. For now it only supports deployment on the Amazon servers. More deployment targets will be added later on.

## Documentation

- [Installation](#installation)
- [How to use](#how-to-use)
- [Init command](#init-command)
- [Build command](#build-command)
  - [Build ignore list](#build-ignore-list)
- [Server command](#server-command)
- [Login command](#login-command)
- [Deploy command](#deploy-command)

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

How to run:
```sh
cordova-hcp init
```

Initialization command for CLI client. Generates default application configuration file (`cordova-hcp.json`) in the projects root folder. This file is used later on for `build` and `deploy`.

When executed - you will be asked to fill in some project preferences from the command line:
- `Project name` - your current project name. **Required**.
- `Amazon S3 Bucket name` - name of the S3 Bucket on the Amazon. **Required for deployment**, can be skipped in other cases.
- `Amazon S3 region` - Amazon S3 region. **Required for deployment**, can be skipped in other cases.
- `iOS app identifier` - applications id on the App Store. Used to redirect user to the applications page on the store.
- `Android app identifier` - applications package name by which we reference app on the Google Play.
- `Update method` - when to perform the update. Supports three keys:
  - `start` - install updates when application is launched;
  - `resume` - install update when application is resumed (moved from background to foreground state) or launched; **used by default**;
  - `now` - install update as soon as it is loaded from the server.

For example, execute `init` in your project root folder and fill preferences as below:
```
Running init
Please provide: Enter project name (required):  TestProject
Please provide: Amazon S3 Bucket name (required for cordova-hcp deploy):  chcp-test
Please provide: Amazon S3 region (required for chcp deploy):  (us-east-1) eu-west-1
Please provide: IOS app identifier:  id123456789
Please provide: Android app identifier:  com.example.chcp.testproject
Please provide: Update method (required):  (resume) start
Project initialized and chcp.json file created.
If you wish to exclude files from being published, specify them in .chcpignore
Before you can push updates you need to run "chcp login" in project directory
```

As a result, content of the `cordova-hcp.json` file will be:
```json
{
  "name": "TestProject",
  "s3bucket": "chcp-test",
  "s3region": "eu-west-1",
  "ios_identifier": "id123456789",
  "android_identifier": "com.example.chcp.testproject",
  "update": "start",
  "content_url": "https://s3-eu-west-1.amazonaws.com/chcp-test"
}
```

You can skip initialization for local development process when you execute
```sh
cordova-hcp server
```
More details about `server` command can be found below.

### Build command

How to run:
```sh
cordova-hcp build
```

Command is used to prepare project for deployment and to generate plugin specific configuration files inside `www` folder:
- `chcp.json` - holds release related information.
- `chcp.manifest` - holds information about web project files: their names (relative paths) and hashes.

When executed - you will see in the terminal window:
```
Running build
Build 2015.09.07-11.20.55 created in /Cordova/TestProject/www
```

As a result, `chcp.json` and `chcp.manifest` files are generated in the `www` folder and project is ready for deployment.

More information about those configs can be found on [Cordova Hot Code Push plugin](#https://github.com/nordnet/cordova-hot-code-push#cordova-hot-code-push-cli-client) documentation page.

#### Build ignore list

In order to exclude files from the build you can:

1. Create `.chcpignore` file in the root of your Cordova Project (for example, `/Cordova/TestProject/.chcpignore`).
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

You can use `server` without running `init` at first. In that case, application configuration file (`www/chcp.json`) is generated with the default values and `autogenerated` flag:
```json
{
  "autogenerated": true,
  "release": "2015.09.07-12.28.38",
  "content_url": "https://19d5cfa2.ngrok.com",
  "update": "now"
}
```

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
