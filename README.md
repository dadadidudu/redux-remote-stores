![npm](https://img.shields.io/npm/v/redux-remote-stores)

# Easily synchronise actions between remote Redux stores

This package provides functionality to synchronise actions between multiple (remote) Redux stores.

It is based on the package [redux-websocket-bridge](https://github.com/compulim/redux-websocket-bridge) by compulim.

## Usage

* Add as middleware to your store
* Create a Websocket connection OR a string with the WebSocket URL you want to connect to.
* Call *addConnectionToStore(WebSocketOrUrl)* with the Websocket or URL as argument
* Call *removeConnectionFromStore(WebSocket)* when you're finished. The connection is automatically closed.
