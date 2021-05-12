import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'features/auth/authSlice';
import groupsReducer from 'features/groups/groupsSlice';
import logger from './logger';


export default configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})
// https://redux-toolkit.js.org/api/configureStore
// accepts a single configuration object parameter, with the following options:
//  "reducer" [required]: function / object to pass to "combineReducers"
//  "middleware": defaults to `getDefaultMiddleware()` which currently returns: 
//      - in development: [thunk, immutableStateInvariant, serializableStateInvariant]
//      - in production: [thunk]
//      see: https://redux-toolkit.js.org/api/getDefaultMiddleware
//  "devTools" [true]: whether to enable DevTools
//  "preloadedState": optional object with main reducer keys
//      preloaded state takes precedence over initial state:
//      https://redux.js.org/recipes/structuring-reducers/initializing-state
//  "enhancers"

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