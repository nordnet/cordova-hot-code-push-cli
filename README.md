# Cordova Hot Code Push Plugin CLI client

This is a command line utility for [Cordova Hot Code Push Plugin](https://github.com/nordnet/cordova-hot-code-push). It will help you with development and deploy changes to your Cordova application via hot code push, without the need to submit your changes to the Apple App Store or Google Play.

Main features are:
- Automatically generate configuration files, required for Hot Code Push plugin (`chcp.json` and `chcp.manifest`).
- Run local server in order to detect any changes you make in your web project and instantly upload them on the devices.
- Deploy your web project on the external servers with the single command. For now it only supports deployment on the Amazon servers. More deployment targets will be added later.

## Documentation

- [Installation](#installation)
- [How to use](#how-to-use)
- [Commands](#commands)
  - [Init command](#init-command)
  - [Build command](#build-command)
  - [Server command](#server-command)
  - [Login command](#login-command)
  - [Deploy command](#deploy-command)
- [Default configuration file](#default-configuration-file)
- [Ignored files list](#ignored-files-list)
- [Normal workflow scheme](#normal-workflow-scheme)
- [Local development workflow scheme](#local-development-workflow-scheme)

### Installation

You can install CLI client using `npm install` (current stable 1.0.4):
```sh
npm install -g cordova-hot-code-push-cli
```

It is also possible to install via repo url directly (__unstable__):
```sh
npm install -g https://github.com/nordnet/cordova-hot-code-push-cli.git
```

### How to use

```sh
cordova-hcp <command>
```

Where `<command>` can be:
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

### Commands

#### Init command

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
Please provide: Amazon S3 region (required for cordova-hcp deploy):  (us-east-1) eu-west-1
Please provide: IOS app identifier:  id123456789
Please provide: Android app identifier:  com.example.chcp.testproject
Please provide: Update method (required):  (resume) start
Project initialized and cordova-hcp.json file created.
If you wish to exclude files from being published, specify them in .chcpignore
Before you can push updates you need to run "cordova-hcp login" in project directory
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

#### Build command

```sh
cordova-hcp build [www_directory]
```

where:
- `[www_directory]` - path to the directory with your web project. If not specified - `www` is used.

Command is used to prepare project for deployment and to generate plugin specific configuration files inside `www` folder:
- `chcp.json` - holds release related information.
- `chcp.manifest` - holds information about web project files: their names (relative paths) and hashes.

When executed - you will see in the terminal window:
```
Running build
Build 2015.09.07-11.20.55 created in /Cordova/TestProject/www
```

As a result, `chcp.json` and `chcp.manifest` files are generated in the `www` folder and project is ready for deployment.

More information about those configs can be found on [Cordova Hot Code Push plugin](https://github.com/nordnet/cordova-hot-code-push) documentation page.

#### Server command

```sh
cordova-hcp server [www_directory]
```

where:
- `[www_directory]` - path to the directory with your web project. If not specified - `www` is used.

Command is used for local development purpose only. It starts local server that listens for changes inside your web folder (with respect to `.chcpignore`) and sends notification about the new release to the connected users. This way you can develop your application and see results in the real-time.

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

1. Launch server in the project root by executing:
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

2. Launch application on your emulators or test devices:
  ```sh
  cordova run
  ```

3. When application starts - it connects to the local server via socket. In the servers console window you should see following message:
  ```sh
  a user connected
  ```

4. Open any file from your `www` folder and do some changes in it. For example, change `index.html`. As a result, you will see in the servers console:
  ```
  File changed:  /TestProject/www/index.html
  Build 2015.09.07-10.12.31 created in /TestProject/www
  Should trigger reload for build: 2015.09.07-10.12.31
  ```

  This means that `cordova-hcp` detected your changes, executed `build` command and sent notification via socket to the connected users.

5. On the mobile side plugin captures `new release` event through the socket and loads it from the server.

**Note:** if during the development you will add some new plugin to the project - then you have to:

1. Delete old version of the app.
2. Reinstall the app with `cordova run` command.

#### Login command

```sh
cordova-hcp login
```

Command requests and saves login credentials, using which deployment on the Amazon servers is performed. You need to run it before doing any deployment. Otherwise, `cordova-hcp` won't now how to login to the Amazon.

When executed, you will be asked to enter your Amazon `Access Key Id` and `Access Key Secret`:
```
Running login
Please provide: Amazon Access Key Id:  YOUR_ACCESS_KEY_ID
Please provide: Amazon Secret Access Key:  YOUR_ACCESS_KEY_SECRET
```

Entered credentials will be placed in the `.chcplogin` file:
```json
{
  "key": "YOUR_ACCESS_KEY_ID",
  "secret": "YOUR_ACCESS_KEY_SECRET"
}
```

From this point you are ready to deploy your project on Amazon server.

**Advise:** don't forget to put `.chcplogin` file in the ignore list of your version control system, if any is used. For git you can do this by executing:
```sh
echo '.chcplogin' >> .gitignore
```

#### Deploy command

```sh
cordova-hcp deploy [www_directory]
```

where:
- `[www_directory]` - path to the directory with your web project. If not specified - `www` is used.

Command uploads your Cordova's web project files on the Amazon server. Can be executed only after `init` and `login` commands.

When executed, you will see the following in the console:
```
Running deploy
Config { name: 'TestProject',
  s3bucket: 'chcp-test',
  s3region: 'eu-west-1',
  ios_identifier: 'id123456789',
  android_identifier: 'com.example.chcp.testproject',
  update: 'start',
  content_url: 'https://s3-eu-west-1.amazonaws.com/chcp-test',
  release: '2015.09.07-13.02.28' }
Build 2015.09.07-13.02.28 created in /Cordova/TestProject/www
Deploy started
Deploy done
```

As a result - all files from your web directory are uploaded to the Amazon server, which was defined on the `init` step.

### Default configuration file

As mentioned in [Init command](#init-command) section of the readme - after executing `cordova-hcp init` command you will get a default configuration file, called `cordova-hcp.json`. It is created in the root folder of your project. When you run `cordova-hcp build` - data from that file is used to generate `chcp.json` file in `www` folder.

If you want - you can create `cordova-hcp.json` manually and put in there any options you want. It's just a JSON object like so:
```json
{
  "update": "start",
  "content_url": "https://mycoolserver.com/mobile_content/"
}
```

By default, you would probably put in there your `content_url`. But it can also be any other setting.

### Ignored files list

By default, CLI client ignores all hidden files, and files from the following list:
```
chcp.json
chcp.manifest
package.json
node_modules/*
```

But if you want - you can extend this list like so:

1. Create `.chcpignore` file in the root of your Cordova Project (for example, `/Cordova/TestProject/.chcpignore`).
2. Add ignored files. For example:

```
dirty.html
images/*
libs/*
```
As a result, those files will be excluded from the `chcp.manifest`, and ignored by the `server` in local development mode.

### Normal workflow scheme

1. Initialize:
  ```sh
  cordova-hcp init
  ```

2. Provide login preferences:
  ```sh
  cordova-hcp login
  ```

3. Build your project:
  ```sh
  cordova-hcp build
  ```

4. Upload project on the server:
  ```sh
  cordova-hcp deploy
  ```

5. When new version is ready - repeat steps `3.` and `4.`.

### Local development workflow scheme

1. Run server:
  ```sh
  cordova-hcp server
  ```

2. Run application:
  ```sh
  cordova run
  ```

3. Do some changes in the `www` folder. Wait for a few moments and see the result on the launched devices (emulators).
