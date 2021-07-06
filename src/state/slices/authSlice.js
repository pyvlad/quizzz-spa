import { createSlice } from '@reduxjs/toolkit';
import * as api from 'api'; 


/* *** SLICE *** */
// authSlice takes care of the work of generating:
//  - action type strings (named as reducer functions below 
//    prefixed by the slice 'name' string below, i.e 'auth/'), 
//  - action creator functions (named as reducer functions below),
//  - action objects.
export const authSlice = createSlice({
  // This string is used as the first part of each action type
  // (the key name of each reducer function is used as the second part).
  name: 'auth',

  initialState: {
    user: api.loadUser(),
  },

  // Redux Toolkit allows us to write "mutating" logic in reducers. It
  // doesn't actually mutate the state because it uses the immer library,
  // which detects changes to a "draft state" and produces a brand new
  // immutable state based off those changes.
  reducers: {
    setCurrentUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    }
  },
})

export default authSlice.reducer;
export const { logout } = authSlice.actions;
export const setCurrentUser = user => async dispatch => {
  api.saveUser(user);
  dispatch(authSlice.actions.setCurrentUser(user));
}
export const logCurrentUserOut = () => dispatch => {
  api.saveUser(null);
  dispatch(logout());
}

/* *** SELECTORS *** */
// The functions below are called a selector and allow us to select values from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCurrentUser = state => state.auth.user;


// No longer used stuff:
// /* *** THUNKS *** */
// // createAsyncThunk returns a thunk action creator
// export const fetchLogin = createAsyncThunk(
//   // type (prefix)
//   'auth/loginRequest', 
//   // payloadCreator callback
//   async ({ username, password }, { dispatch, rejectWithValue }) => {
//     try {
//       const user = await api.login(username, password);
//       api.saveUser(user);
//       return user;
//     } catch(e) {
//       const message = (e.status === 400) ? "Incorrect credentials." : e.message;
//       dispatch(showMessage(message, 'error'));
//       return rejectWithValue(message);
//     }
//   }
// )

// export const fetchLogout = createAsyncThunk(
//   'auth/logoutRequest',
//   async (_, { dispatch, rejectWithValue }) => {
//     try {
//       const result = await api.logout();
//       api.saveUser(null);
//       return result;
//     } catch(e) {
//       dispatch(showMessage(e.message, 'error'));
//       return rejectWithValue(e.message);
//     }
//   }
// )

// extraReducers: {
//   [fetchLogin.pending]: (state, action) => {
//     state.loading = true;
//   },
//   [fetchLogin.fulfilled]: (state, action) => {
//     state.loading = false;
//     state.user = action.payload;
//   },
//   [fetchLogin.rejected]: (state, action) => {
//     state.loading = false;
//   },
//   [fetchLogout.pending]: state => {
//     state.loading = true;
//   },
//   [fetchLogout.fulfilled]: state => {
//     state.loading = false;
//     state.user = null;
//   },
//   [fetchLogout.rejected]: (state, action) => {
//     state.loading = false;
//   },
// }


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
//     dispatch(loginRequestFail(e.message);
//   }
// }


// export const sendLogoutRequest = () => async (dispatch) => {
//   dispatch(logoutRequestStart());
//   try {
//     await logout();
//     dispatch(logoutRequestSuccess());
//   } catch(e) {
//     dispatch(logoutRequestFail(e.message);
//   }
// }