const { applyMiddleware, createStore: createReduxStore } = require('redux');
const { default: createSagaMiddleware }                  = require('redux-saga');
const { default: createReduxWebSocketBridge }            = require('redux-websocket-bridge');
const sagas                                              = require('./sagas');

module.exports = function createStore() {
  const sagaMiddleware = createSagaMiddleware();
  const reduxWsBridgeMiddleware = createReduxWebSocketBridge();

  const store = applyMiddleware(
    reduxWsBridgeMiddleware,
    sagaMiddleware
  )(createReduxStore)((state = {}) => state);

  sagaMiddleware.run(sagas);

  console.log("store created");

  return store;
}
