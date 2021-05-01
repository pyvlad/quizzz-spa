import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import logger from './logger';

import { authReducer } from 'features/auth';


// configure store
const reducer = combineReducers({
  auth: authReducer,
});

const preloadedState = {};
// preloaded state takes precedence over initial state:
// https://redux.js.org/recipes/structuring-reducers/initializing-state

const middleware = applyMiddleware(thunk, logger);
/*
  Redux Thunk: 
    Any time you attempt to dispatch a function instead of an action object, 
    the middleware will call that function with dispatch method itself 
    as the first argument.

    const thunk = (store) => (next) => (action) => 
    typeof action === 'function' 
      ? action(store.dispatch, store.getState)
      : next(action)

    Thus, thunks can use dispatch to call other thunks and so on.
    Only plain object actions reach the logger and then the reducers.
    https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559
*/

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, preloadedState, composeEnhancers(middleware));

export default store;