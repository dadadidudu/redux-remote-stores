# Unfolds and dispatches WebSocket messages into Redux store

Inspired by [redux-websocket](https://github.com/giantmachines/redux-websocket).

This bridge middleware will:

* Dispatches WebSocket messages into Redux store
  * As `@@websocket/MESSAGE`, payload as-is
  * Unfold as a Redux action
* Pumps Redux action payload to WebSocket

## How to use

* [Store](#store)
* [Reducer](#reducer)
* [Action](#action)

### Store

```js
import { applyMiddleware, createStore } from 'redux';
import WebSocketActionBridge from 'redux-websocket-bridge';

const createStoreWithMiddleware = applyMiddleware(
  WebSocketActionBridge('ws://localhost:4000/', { unfold: true })
)(createStore);

export default createStore(...);
```

> Tips: you can add more than one `WebSocketBridge` to your store by namespacing them with [`actionPrefix`](#options).

### Reducer

Because we support multiple bridges in a single store, namespace prefix is added to action type, by default, `@@websocket/`.

```js
import { OPEN, CLOSE, MESSAGE } from 'redux-websocket-bridge';

function serverConnectivity(state = {}, action) {
  switch (action.type) {
  case `@@websocket/${ OPEN }`:
    state = { ...state, connected: true };
    break;

  case `@@websocket/${ CLOSE }`:
    state = { ...state, connected: false };
    break;

  case `@@websocket/${ MESSAGE }`:
    // Process the raw message here, either string, ArrayBuffer, or Blob
    break;

  default: break;
  }

  return state;
}
```

When an event is received thru the WebSocket, it will be dispatched into the store as one of the actions below:

```js
// When the socket is connected
{
  "type": "@@websocket/OPEN"
}
```

```js
// When the socket is disconnected
{
  "type": "@@websocket/CLOSE"
}
```

```js
// When the socket received a message, the payload is a string
{
  "type": "@@websocket/MESSAGE",
  "payload": "<string, ArrayBuffer, or Blob>"
}
```

### Action

To send a message, you dispatch an action with the payload and set `type` to `@@websocket/SEND`. You can only send payload your WebSocket implementation support, e.g. `string`, `ArrayBuffer`, and `Blob`.

```js
import { SEND } from 'redux-websocket-action-bridge';

function fetchServerVersion() {
  return { type: `@@websocket/${ SEND }`, payload: '<Raw message here>' };
}
```

## Unfolding message

Instead of receiving WebSocket messages as a generic `@@websocket/MESSAGE` action, the bridge can automatically unfold the payload if it is a JSON and looks like a [Flux Standard Action](https://github.com/acdlite/flux-standard-action). For example, the following WebSocket message will be unfolded:

```js
"{\"type\":\"SERVER/ALIVE\",\"payload\":{\"version\":\"1.0.0\"}}"
```

It will be unfolded into an action:

```js
{
  type: 'SERVER/ALIVE',
  payload: { version: '1.0.0' }
}
```

By unfolding Redux actions, you can reduce code and create interesting code pattern. For example, server can send greeting action on connect. The WebSocket message will be directly dispatched into Redux store.

```js
ws.on('connection', socket => {
  socket.send(JSON.stringify({
    type: 'SERVER/VERSION',
    payload: {
      version: require('./package.json').version
    }
  }));
});
```

Unfold also applies when you are sending out a JavaScript object that looks like an action.

```js
this.props.dispatch({
  type: '@@websocket/SEND',
  payload: {
    type: 'CLIENT/SIGN_IN',
    payload: { token: 'my very secret token' }
  }
}));
```

> What-if: if you are sending a JavaScript object and it does not pass the FSA test, it will be passed to `WebSocket.send()` as-is without modifications.

In addition to sending over WebSocket, the action will also dispatch locally.

```js
{
  type: 'CLIENT/SIGN_IN',
  payload: { token: 'my very secret token' }
}
```

## Advanced topics

* [Use SockJS](#use-sockjs)
  * [WebSocket APIs used by the bridge](#websocket-apis-used-by-the-bridge)
* [Prefer `ArrayBuffer`](#prefer-arraybuffer)

### Use SockJS

The bridge supports any libraries that adheres to WebSocket standard, for example, [SockJS](http://sockjs.org), which provides fallback for browser/proxy that does not support WebSocket.

```js
const createStoreWithMiddleware = applyMiddleware(
  WebSocketBridge(
    () => new SockJS('http://localhost:3000/ws/')
  )
)(createStore);
```

#### WebSocket APIs used by the bridge

If you are unsure if your WebSocket implementation will work on the bridge or not, check it against the list of required WebSocket APIs list below:

* `onopen`
* `onclose`
* `onmessage(event)`
  * `event.data`
    * Unfold enabled: it should support returning `string`
* `send`
  * Unfold enabled: it should support sending `string`

### Prefer `ArrayBuffer`

WebSocket standard support sending binary data. But receiving binary data means you might be receiving either `ArrayBuffer` or `Blob`, depends on your WebSocket implementation.

For your convenience, if you set `binaryType` to `arrayBuffer`, we will convert all `Blob` into `ArrayBuffer` before dispatching it to Redux store.

Vice versa, if you set `binaryType` to `blob`, we will convert all `ArrayBuffer` into `Blob`.

## Options

| Name | Description | Default |
| - | - | - |
| `actionPrefix` | Action prefix for all system messages | `"@@websocket/"` |
| `binaryType` | Convert binary to `"arrayBuffer"` or `"blob"` | `null` |
| `unfold` | Unfold messages as actions if they are JSON and look like a [Flux Standard Action](https://github.com/acdlite/flux-standard-action), and vice versa | `false` |

## Contributions

Like us? [Star](https://github.com/compulim/redux-websocket-action-bridge/stargazers) us.

Something not right? File us an [issue](https://github.com/compulim/redux-websocket-action-bridge/issues).
