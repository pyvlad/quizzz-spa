import { createSlice } from '@reduxjs/toolkit';

import { login, logout, loadUser } from './api'; 


// authSlice takes care of the work of generating:
//  - action type strings (named as reducer functions below 
//    prefixed by the slice 'name' string below, i.e 'auth/'), 
//  - action creator functions (named as reducer functions below),
//  - action objects.
export const authSlice = createSlice({
  name: 'auth',
  // This string is used as the first part of each action type
  // (the key name of each reducer function is used as the second part).

  initialState: {
    user: loadUser(),
    loading: false,
    error: '',
  },

  // Redux Toolkit allows us to write "mutating" logic in reducers. It
  // doesn't actually mutate the state because it uses the immer library,
  // which detects changes to a "draft state" and produces a brand new
  // immutable state based off those changes.
  reducers: {
    loginRequestStart: state => {
      state.loading = true;
      state.error = '';
    },
    loginRequestSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    loginRequestFail: (state, action) => {
      state.loading = false;
      const { message, userMessage } = action.payload;
      state.error = userMessage ? userMessage : message;
    },
    logoutRequestStart: state => {
      state.loading = true;
      state.error = '';
    },
    logoutRequestSuccess: state => {
      state.loading = false;
      state.user = null;
    },
    logoutRequestFail: (state, action) => {
      state.loading = false;
      const { message, userMessage } = action.payload;
      state.error = userMessage ? userMessage : message;
    },
  }
})

export default authSlice.reducer;


const { 
  loginRequestStart, loginRequestSuccess, loginRequestFail,
  logoutRequestStart, logoutRequestSuccess, logoutRequestFail,
} = authSlice.actions;


export const sendLoginRequest = (username, password) => async (dispatch) => {
  dispatch(loginRequestStart());

  try {
    const data = await login(username, password);
    dispatch(loginRequestSuccess(data));
  } catch(e) {
    dispatch(loginRequestFail((e.data) ? e.data : {message: e.message}));
  }
}


export const sendLogoutRequest = () => async (dispatch) => {
  dispatch(logoutRequestStart());

  try {
    await logout();
    dispatch(logoutRequestSuccess());
  } catch(e) {
    dispatch(logoutRequestFail((e.data) ? e.data : {message: e.message}));
  }
}


// SELECTORS
// The functions below are called a selector and allow us to select values from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCurrentUser = state => state.auth.user;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;