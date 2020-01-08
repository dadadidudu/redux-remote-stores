![npm](https://img.shields.io/npm/v/redux-remote-stores)

# Easily synchronise actions between remote Redux stores

This package provides functionality to synchronise actions between multiple (remote) Redux stores.

It is based on the package [redux-websocket-bridge](https://github.com/compulim/redux-websocket-bridge) by compulim and uses its functionality to transfer the Redux Actions.

## Usage

* Add as middleware to your store with *createWebSocketMiddleware()*
* Create a Websocket connection OR a string with the WebSocket URL you want to connect to.
* Call *addConnectionToStore(WebSocketOrUrl)* with the Websocket or URL as argument
* Add ```{meta: {send: true}}``` to your Redux Actions to transfer them over the connection. Alternatively, you can use the type ```@@websocket/*``` as well. See [redux-websocket-bridge](https://github.com/compulim/redux-websocket-bridge) for more details.
* Call *removeConnectionFromStore(WebSocket)* when you're finished. The connection is automatically closed.
* Call *removeAllConnectionsFromStore* to close and clear all connections.

## Disclaimer & Coming up soon

This is a work-in-progress. I will try to rwewrite the code in Typescript and provide type information as soon as I find time for it.
