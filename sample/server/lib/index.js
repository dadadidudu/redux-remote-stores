const http = require('http');
const WebSocket = require('ws');
const createStore = require('./createStore');
const { addConnectionToBridge, removeConnectionFromBridge, removeAllConnectionsFromBridge } = require('redux-websocket-bridge');

const port =  4000;
const wss = new WebSocket.Server({ port });

createStore();

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('error', err => {
    console.error(err);
  });

  ws.on('close', err => {
    removeConnectionFromBridge(ws);
    console.log('Client ' + ws.url + ' removed vom bridge and closed');
  });

  ws.on('message', data => {
    console.log(data);
  });

  addConnectionToBridge(ws);
  console.log('Client ' + ws.url + ' added to bridge');

});
