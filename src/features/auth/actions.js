import {
  LOGIN_REQUEST_START,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAIL,
  LOGOUT_REQUEST_START,
  LOGOUT_REQUEST_SUCCESS,
  LOGOUT_REQUEST_FAIL,
  USER_REQUEST_START,
  USER_REQUEST_SUCCESS,
  USER_REQUEST_FAIL,
} from './actionTypes';

import { login, logout, fetchCurrentUser } from './api';


export const sendLoginRequest = (username, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST_START });

  try {
    const { status, data } = await login(username, password);
    
    if (status === 200) {
      dispatch({ type: LOGIN_REQUEST_SUCCESS })
    } else {
      dispatch({
        type: LOGIN_REQUEST_FAIL,
        payload: { error: data }
      })
    }
  } catch(error) {
    dispatch({ type: LOGIN_REQUEST_FAIL,
      payload: { error }
    })
  }
}


export const sendLogoutRequest = () => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST_START });

  try {
    const { status, data } = await logout();

    if (status === 200) {
      dispatch({ type: LOGOUT_REQUEST_SUCCESS })
    } else {
      dispatch({
        type: LOGOUT_REQUEST_FAIL,
        payload: { error: data }
      })
    }
  } catch(error) {
    dispatch({
      type: LOGOUT_REQUEST_FAIL,
      payload: { error }
    })
  }
}


export const sendUserRequest = () => async (dispatch) => {
  dispatch({ type: USER_REQUEST_START });

  const { status, data } = await fetchCurrentUser();

  try {
    if (status === 200) {
      dispatch({
        type: USER_REQUEST_SUCCESS,
        payload: data
      })
    } else {
      dispatch({
        type: USER_REQUEST_FAIL,
        payload: {
          error: data,
          status: status,
        }
      })
    }
  } catch(error) {
    dispatch({
      type: USER_REQUEST_FAIL,
      payload: {
        error
      }
    })
  }
}