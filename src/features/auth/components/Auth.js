import React from 'react';
import { connect } from 'react-redux';

import { sendLoginRequest, sendLogoutRequest, sendUserRequest } from '../authSlice';
import { selectUser, selectAuthenticated, selectMessage } from '../authSlice';
import User from './User';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm';


const Auth = ({ authenticated, user, message, 
  sendLoginRequest, sendLogoutRequest, sendUserRequest, children }) => {
  
  React.useEffect(() => sendUserRequest(), [sendUserRequest])

  React.useEffect(() => {
    if (authenticated && !user) sendUserRequest();
  }, [authenticated, user, sendUserRequest])
  
  return (
    <div>
      <div style={{color:"red", fontStyle:"italic"}}>
        { message ? JSON.stringify(message) : "" }
      </div>
      <User user={ user } />
      { 
        authenticated 
        ? <div>
            <LogoutForm submitForm={ sendLogoutRequest } />
            { children }
          </div>
        : <div>
            <p>Please log in.</p>
            <LoginForm submitForm={ sendLoginRequest } />
          </div>
      }
    </div>
  )
}


// Now this is a container component, completely self-sufficient
// and can be used inside presentational components without passing extra props
const AuthContainer = connect(
  (state, ownProps) => ({ 
    authenticated: selectAuthenticated(state),
    user: selectUser(state),
    message: selectMessage(state),
  }),
  {
    sendLoginRequest, 
    sendLogoutRequest,
    sendUserRequest,
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
