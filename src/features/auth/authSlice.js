import { createSlice } from '@reduxjs/toolkit';

import { login, logout, fetchCurrentUser } from './api';


// createSlice takes care of the work of generating:
//  - action type strings (named as reducer functions below 
//    prefixed by the slice 'name' string below, i.e 'auth/'), 
//  - action creator functions (named as reducer functions below),
//  - action objects.
export const counterSlice = createSlice({
  name: 'auth',
  // This string is used as the first part of each action type
  // (the key name of each reducer function is used as the second part).

  initialState: {
    authenticated: false,
    user: null,
    message: null
  },

  // Redux Toolkit allows us to write "mutating" logic in reducers. It
  // doesn't actually mutate the state because it uses the immer library,
  // which detects changes to a "draft state" and produces a brand new
  // immutable state based off those changes.
  reducers: {
    loginRequestStart: state => {
      state.message = 'Please, wait...';
    },
    loginRequestSuccess: state => {
      state.authenticated = true;
      state.message = null;
    },
    loginRequestFail: (state, action) => {
      state.message = action.payload;
    },
    logoutRequestStart: state => {
      state.message = 'Please, wait...';
    },
    logoutRequestSuccess: state => {
      state.authenticated = false;
      state.message = null;
      state.user = null;
    },
    logoutRequestFail: (state, action) => {
      state.message = action.payload;
    },
    userRequestStart: state => {
      state.message = 'Please, wait...';
    },
    userRequestSuccess: (state, action) => {
      state.authenticated = true;
      state.user = action.payload;
      state.message = null;
    },
    userRequestFail: (state, action) => {
      const { error } = action.payload;
      const message = (state.authenticated) ? error : null;
      return {
        ...state,
        authenticated: false,
        user: null,
        message
      }
    },
  }
})

export default counterSlice.reducer;


const { 
  loginRequestStart, loginRequestSuccess, loginRequestFail,
  logoutRequestStart, logoutRequestSuccess, logoutRequestFail,
  userRequestStart, userRequestSuccess, userRequestFail 
} = counterSlice.actions;


export const sendLoginRequest = (username, password) => async (dispatch) => {
  dispatch(loginRequestStart());

  try {
    const { status, data } = await login(username, password);
    dispatch((status === 200) 
      ? loginRequestSuccess() 
      : loginRequestFail({ error: data })
    );
  } catch(error) {
    dispatch(loginRequestFail({ error }));
  }
}


export const sendLogoutRequest = () => async (dispatch) => {
  dispatch(logoutRequestStart());

  try {
    const { status, data } = await logout();
    dispatch((status === 200) 
      ? logoutRequestSuccess() 
      : logoutRequestFail({ error: data })
    );
  } catch(error) {
    dispatch(logoutRequestFail({ error }));
  }
}


export const sendUserRequest = () => async (dispatch) => {
  dispatch(userRequestStart());

  try {
    const { status, data } = await fetchCurrentUser();
    dispatch((status === 200) 
      ? userRequestSuccess(data)
      : userRequestFail({error: data, status})
    );
  } catch(error) {
    dispatch(userRequestFail({error}))
  }
}


// SELECTORS
// The functions below are called a selector and allow us to select values from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectAuthenticated = state => state.auth.authenticated;
export const selectUser = state => state.auth.user;
export const selectMessage = state => state.auth.message;