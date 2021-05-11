import React from 'react';
import { connect } from 'react-redux';

import { selectCurrentUser } from 'features/auth/authSlice';
import Time from './Time';
import Home from './Home';


const Content = ({ user }) => {
  return user
    ? <div>
        <p>{ user ? `Hello, ${user.username}!` : 'Welcome to the website!' }</p>
        <div>{ user ? <Time /> : 'Please log in.' }</div>
      </div>
    : <Home />
}


// Now this is a container component, completely self-sufficient
// and can be used inside presentational components without passing extra props
const ContentContainer = connect(
  (state, ownProps) => ({ 
    user: selectCurrentUser(state),
  })
  // Such object notation does this for each action creator:
  //    sendLoginRequest: (...args) => dispatch(sendLoginRequest(...args))
  //    sendLogoutRequest: (...args) => dispatch(sendLogoutRequest(...args))
  // Then, redux-thunk does its own thing:
  //    Since sendLoginRequest(...args) returns a function that takes (dispatch) as arg,
  //    it means that we're attempting to dispatch a function instead of an action object, 
  //    so the middleware calls that function with 'dispatch'.
  // See: https://react-redux.js.org/using-react-redux/connect-mapdispatch
)(Content)


export default ContentContainer;
