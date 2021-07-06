import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import myGroupsReducer from './slices/myGroupsSlice';
import activeGroupReducer from './slices/activeGroupSlice';
import messagesReducer from './slices/messagesSlice';
import loadingReducer from './slices/loadingSlice';


export default configureStore({
  reducer: {
    auth: authReducer,
    myGroups: myGroupsReducer,
    activeGroup: activeGroupReducer,
    messages: messagesReducer,
    loading: loadingReducer,
  }
})
// https://redux-toolkit.js.org/api/configureStore
// accepts a single configuration object parameter, with the following options:
//  "reducer" [required]: function / object to pass to "combineReducers"
//  "middleware": defaults to `getDefaultMiddleware()` which currently returns: 
//      - in development: [thunk, immutableStateInvariant, serializableStateInvariant]
//      - in production: [thunk]
//      see: https://redux-toolkit.js.org/api/getDefaultMiddleware
//      To add middleware, e.g.:
//        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
//  "devTools" [true]: whether to enable DevTools
//  "preloadedState": optional object with main reducer keys
//      preloaded state takes precedence over initial state:
//      https://redux.js.org/recipes/structuring-reducers/initializing-state
//  "enhancers"