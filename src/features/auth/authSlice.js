import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { login, logout, loadUser, clientError } from 'api'; 


// createAsyncThunk returns a thunk action creator
export const fetchLogin = createAsyncThunk(
  // type (prefix)
  'auth/loginRequest', 
  // payloadCreator callback
  async ({ username, password }, { rejectWithValue }) => {
    try {
      return await login(username, password);
    } catch(e) {
      return rejectWithValue(clientError(e));
    }
  }
)


export const fetchLogout = createAsyncThunk(
  'auth/logoutRequest',
  async (_, { rejectWithValue }) => {
    try {
      return await logout();
    } catch(e) {
      return rejectWithValue(clientError(e));
    }
  }
)


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
  reducers: {},
  extraReducers: {
    [fetchLogin.pending]: (state, action) => {
      state.loading = true;
      state.error = '';
    },
    [fetchLogin.fulfilled]: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    [fetchLogin.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [fetchLogout.pending]: state => {
      state.loading = true;
      state.error = '';
    },
    [fetchLogout.fulfilled]: state => {
      state.loading = false;
      state.user = null;
    },
    [fetchLogout.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
  }
})

export default authSlice.reducer;


// SELECTORS
// The functions below are called a selector and allow us to select values from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCurrentUser = state => state.auth.user;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;


// This is basically what the createAsyncThunk functions are doing:

// These action creator would correspond to actions defined in 'reducers' of the slice: 
// const { 
//   loginRequestStart, loginRequestSuccess, loginRequestFail,
//   logoutRequestStart, logoutRequestSuccess, logoutRequestFail,
// } = authSlice.actions;


// export const sendLoginRequest = (username, password) => async (dispatch) => {
//   dispatch(loginRequestStart());
//   try {
//     const data = await login(username, password);
//     dispatch(loginRequestSuccess(data));
//   } catch(e) {
//     dispatch(loginRequestFail((e.data) ? e.data : {message: e.message}));
//   }
// }


// export const sendLogoutRequest = () => async (dispatch) => {
//   dispatch(logoutRequestStart());
//   try {
//     await logout();
//     dispatch(logoutRequestSuccess());
//   } catch(e) {
//     dispatch(logoutRequestFail((e.data) ? e.data : {message: e.message}));
//   }
// }