/**
 *
 * Watcher
 *
 * @description :: Client side directory watcher to perform folder sync
 * @help ::
 * */

var chokidar = require('chokidar');
var fs = require('fs-extra');
var fsPath = require('path');
var request = require('request');
var uuid = require('node-uuid');
var deepEqual = require('deep-equal');
var SailsIo = require('sailsjs-socket.io-client');

// Get User home directory
var homeDirectory = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
// Setup uploader home directory
var ImLinkUpDirectory = homeDirectory + '/ImlinkUp';
// Set API end point
var apiURL = 'http://192.168.21.32/client/';
// Generate session key
var sessionUUID = uuid.v4();
// Connect socket client to server

// =============== SOCKET ================
SailsIo.connect('http://192.168.21.32', {}, function (socket) {

  socket.on('connecting', function () {
    console.info('Connecting to websocket server on ', apiURL);
  });
  socket.on('connect', function () {
    console.info('connected to', apiURL);

    socket.on(sessionUUID, function (data) {
      console.log('Emiting at ' + data.speedMbps + ' mbps ' + data.percent + '% uploaded');
    });

    socket.on('disconnect', function (reason) {
      console.info('Disconnected from websocket server on ', apiURL, reason);
    });
  });

  socket.on('error', function (reason) {
    console.error('(EE) Error connecting to server: ' + reason);
    process.exit(code = 0);
  });

});
// =============== SOCKET ================

// Create ImlinkUp Directory to watch
fs.mkdirs(ImLinkUpDirectory, function (err) {
  var watcher;

  if (err) return console.error(err);

  console.log(
    'ImlinkUp Watch Directory Created: ',
    ImLinkUpDirectory,
    '\n--------------------------------');

  // Start Watching directory
  watcher = chokidar.watch(ImLinkUpDirectory, {
    ignored       : /[\/\\]\./,
    persistent    : true,
    interval      : 250,
    binaryInterval: 600,
    depth         : 100
  });

  watcher
    .on('add', function (path) {
      doFSEvent(path, 'add');
    })
    .on('addDir', function (path) {
      doFSEvent(path, 'addDir');
    })
    .on('change', function (path) {
      doFSEvent(path, 'change');
    })
    .on('unlink', function (path) {
      doFSEvent(path, 'unlink');
    })
    .on('unlinkDir', function (path) {
      doFSEvent(path, 'unlinkDir');
    })
    .on('error', function (error) {
      console.log('Error happened', error);
    })
    .on('ready', function () {
      // Get remote & local volume tree
      var localTree;
      var remoteTree;

      console.log('Initial scan complete. Ready for changes.');
      // Todo: Perform sync with remote DB

      // compare local tree with remote tree
      deepEqual(localTree, remoteTree);

      // Sync Files

      // Upload to remote

      // Download from remote

    })
    .on('raw', function (event, path, details) {
      //log('Raw event info:', event, path, details);
    });


});


function doFSEvent(path, event) {
  var formData;

  // Upload files data
  formData = {
    clientPath : ImLinkUpDirectory,
    type       : '',
    size       : '',
    name       : fsPath.basename(path),
    company    : 'imtech',
    path       : path.replace(ImLinkUpDirectory, '').length ? path.replace(ImLinkUpDirectory, '') : '/',
    sessionUUID: sessionUUID
  };

  console.info('Uploading file: ', formData.name);

  switch (event) {

    case 'add':
      formData.type = 'file';

      // Upload only if this is a file
      formData['files'] = fs.createReadStream(path);

      doHttp(event, formData);
      break;

    case 'addDir':
      formData.type = 'directory';
      doHttp(event, formData);
      break;

    default:
      doHttp(event, formData);
      break;
  }
}


function doHttp(event, formData) {
  request.post({url: apiURL + event, formData: formData}, function (err, httpResponse, body) {
    if (err) return console.error(event, formData, err);

    console.log(event, ': ', body);
  });
}
