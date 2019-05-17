import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import logger from "redux-logger";
import freeze from "redux-freeze";
import thunk from "redux-thunk";
import home from "./reducers/home";

/**
 *  This defines base configuration for setting up redux with react.
 *  All the middlewares are defined here and base store is created for provider.
 */

let middlewares = [];

const reducers = combineReducers({
  home
});

const rootReducer = (state, action) => {
  /* eslint-disable no-param-reassign */
  return reducers(state, action);
};

//for async operations, network calls
middlewares.push(thunk);

//smart console logging of actions
middlewares.push(logger);

// add freeze dev middleware
// this prevents state from being mutated anywhere in the app during dev
if (process.env.NODE_ENV !== "production") {
  middlewares.push(freeze);
}

// apply middlewares
let middleware = applyMiddleware(...middlewares);

// create store
const store = createStore(rootReducer, compose(middleware));

// export
export default store;