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


const initialState = {
  authenticated: false,
  user: null,
  message: null
}


const reducer = (state=initialState, action) => {

  switch (action.type) {

    case LOGIN_REQUEST_START: {
      return {
        ...state,
        message: 'Please, wait...',
      }
    }

    case LOGIN_REQUEST_SUCCESS: {
      return {
        ...state,
        authenticated: true,
        message: null,
      }
    }

    case LOGIN_REQUEST_FAIL: {
      return {
        ...state,
        message: action.payload,
      }
    }

    case LOGOUT_REQUEST_START: {
      return {
        ...state,
        message: 'Please, wait...',
      }
    }

    case LOGOUT_REQUEST_SUCCESS: {
      return {
        ...state,
        authenticated: false,
        user: null,
        message: null,
      }
    }

    case LOGOUT_REQUEST_FAIL: {
      return {
        ...state,
        message: action.payload,
      }
    }

    case USER_REQUEST_START: {
      return {
        ...state,
        message: 'Please, wait...',
      }
    }

    case USER_REQUEST_SUCCESS: {
      return {
        ...state,
        authenticated: true,
        user: action.payload,
        message: null,
      }
    }

    case USER_REQUEST_FAIL: {
      const message = (state.authenticated) ? action.payload.error : null;
      return {
        ...state,
        authenticated: false,
        user: null,
        message
      }
    }

    default:
      return state;
  }
}

export default reducer; 