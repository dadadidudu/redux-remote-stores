'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SEND = exports.OPEN = exports.MESSAGE = exports.CLOSE = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.close = close;
exports.message = message;
exports.open = open;
exports.addConnectionToStore = addConnectionToStore;
exports.removeConnectionFromStore = removeConnectionFromStore;
exports.removeAllConnectionsFromStore = removeAllConnectionsFromStore;
exports.createWebSocketMiddleware = createWebSocketMiddleware;
exports.trimUndefined = trimUndefined;

var _blobToArrayBuffer = require('./blobToArrayBuffer');

var _blobToArrayBuffer2 = _interopRequireDefault(_blobToArrayBuffer);

var _isFSA = require('./isFSA');

var _isFSA2 = _interopRequireDefault(_isFSA);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var CLOSE = exports.CLOSE = 'CLOSE';
var MESSAGE = exports.MESSAGE = 'MESSAGE';
var OPEN = exports.OPEN = 'OPEN';
var SEND = exports.SEND = 'SEND';

function close() {
  return { type: CLOSE };
}

function message(payload) {
  return { type: MESSAGE, payload: payload };
}

function open() {
  return { type: OPEN };
}

var webSockets = [];
var storeRef = void 0;
var options = void 0;

function addConnectionToStore(websocketOrUrl) {
  var websocket = void 0;

  if (typeof websocketOrUrl === "string") websocket = new WebSocket(websocketOrUrl);else websocket = websocketOrUrl;

  if (storeRef === undefined) throw new Error("Redux store must be set up before adding connections.");

  initWebSocket(websocket, storeRef);
  webSockets.push(websocket);
}

function removeConnectionFromStore(websocket) {

  var wsIndex = webSockets.findIndex(function (ws) {
    return ws === websocket;
  });

  if (wsIndex > -1) {
    if (websocket.readyState !== websocket.CLOSING || websocket.readyState !== websocket.CLOSED) webSockets[wsIndex].close();
    webSockets.splice(wsIndex, 1);
  }
}

function removeAllConnectionsFromStore() {
  webSockets.forEach(function (ws) {
    return ws.close();
  });
  webSockets = [];
}

var DEFAULT_OPTIONS = {
  binaryType: 'arraybuffer',
  fold: function fold(action, webSocket) {
    if (action.meta && arrayify(action.meta.send).some(function (send) {
      return send === true || send === webSocket;
    })) {
      var meta = action.meta,
          actionWithoutMeta = _objectWithoutProperties(action, ['meta']);

      return JSON.stringify(actionWithoutMeta);
    }
  },
  meta: {},
  namespace: '@@websocket/',
  unfold: function unfold(payload, webSocket, raw) {
    var action = tryParseJSON(payload);

    return action && _extends({}, action, {
      meta: _extends({}, action.meta, {
        webSocket: webSocket
      })
    });
  }
};

function arrayify(obj) {
  return obj ? Array.isArray(obj) ? obj : [obj] : [];
}

function createWebSocketMiddleware() {
  var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_OPTIONS;

  options = _extends({}, DEFAULT_OPTIONS, customOptions);
  options.binaryType = customOptions.binaryType.toLowerCase();
  options.unfold = customOptions.unfold && (typeof customOptions.unfold === 'function' ? customOptions.unfold : DEFAULT_OPTIONS.unfold);

  return function (store) {
    storeRef = store;

    return function (next) {
      return function (action) {
        if (action.type === '' + options.namespace + SEND) {
          webSockets.forEach(function (webSocket) {
            return webSocket.send(action.payload);
          });
        } else {
          webSockets.forEach(function (webSocket) {
            var payload = options.fold(action, webSocket);
            payload && webSocket.send(payload);
          });
        }

        return next(action);
      };
    };
  };
}

function tryParseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (err) {}
}

function trimUndefined(map) {
  return Object.keys(map).reduce(function (nextMap, key) {
    var value = map[key];

    if (typeof value !== 'undefined') {
      nextMap[key] = value;
    }

    return nextMap;
  }, {});
}

function initWebSocket(webSocket, store) {
  webSocket.onopen = function () {
    return store.dispatch({ type: '' + options.namespace + OPEN, meta: { webSocket: webSocket } });
  };
  webSocket.onclose = function () {
    return store.dispatch({ type: '' + options.namespace + CLOSE, meta: { webSocket: webSocket } });
  };
  webSocket.onmessage = function (event) {
    var getPayload = void 0;

    if (typeof Blob !== 'undefined' && options.binaryType === 'blob' && event.data instanceof Blob) {
      getPayload = (0, _blobToArrayBuffer2.default)(event.data);
    } else if (typeof ArrayBuffer !== 'undefined' && options.binaryType === 'arraybuffer' && event.data instanceof ArrayBuffer) {
      getPayload = new Blob([event.data]);
    } else {
      // We make this a Promise because we might want to keep the sequence of dispatch, @@websocket/MESSAGE first, then unfold later.
      getPayload = Promise.resolve(event.data);
    }

    return getPayload.then(function (payload) {
      if (options.unfold) {
        var action = options.unfold(payload, webSocket, payload);

        if (action) {
          if (!(0, _isFSA2.default)(action)) {
            throw new Error('Unfolded action is not a Flux Standard Action compliant');
          }

          return action && store.dispatch(action);
        }
      }

      store.dispatch({
        type: '' + options.namespace + MESSAGE,
        meta: { webSocket: webSocket },
        payload: payload
      });
    });
  };
}
//# sourceMappingURL=index.js.map