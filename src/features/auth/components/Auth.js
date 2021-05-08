import React from 'react';
import { connect } from 'react-redux';

import { fetchLogin, fetchLogout } from '../authSlice';
import { selectCurrentUser, selectAuthLoading, selectAuthError } from '../authSlice';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm';
import Greeting from './Greeting';
import Message from './Message';


const Auth = ({ user, isLoading, authError, 
  fetchLogin, fetchLogout, children }) => {
  
  const msg = isLoading 
    ? 'Please, wait...'
    : ((authError) ? authError : "")

  return (
    <div>
      <Greeting user={ user } />
      <Message msg={ msg } />
      { 
        user 
        ? <div>
            <LogoutForm submitForm={ fetchLogout } />
            { children }
          </div>
        : <div>
            <p>Please log in.</p>
            <LoginForm submitForm={ (username, password) => fetchLogin({username, password}) } />
          </div>
      }
    </div>
  )
}


// Now this is a container component, completely self-sufficient
// and can be used inside presentational components without passing extra props
const AuthContainer = connect(
  (state, ownProps) => ({ 
    user: selectCurrentUser(state),
    isLoading: selectAuthLoading(state),
    authError: selectAuthError(state),
  }),
  {
    fetchLogin, 
    fetchLogout,
  }
  // Such object notation does this for each action creator:
  //    sendLoginRequest: (...args) => dispatch(sendLoginRequest(...args))
  //    sendLogoutRequest: (...args) => dispatch(sendLogoutRequest(...args))
  // Then, redux-thunk does its own thing:
  //    Since sendLoginRequest(...args) returns a function that takes (dispatch) as arg,
  //    it means that we're attempting to dispatch a function instead of an action object, 
  //    so the middleware calls that function with 'dispatch'.
  // See: https://react-redux.js.org/using-react-redux/connect-mapdispatch
)(Auth)


export default AuthContainer;
