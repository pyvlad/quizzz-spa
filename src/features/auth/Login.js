import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import LoginForm from './LoginForm';
import LoginFormWrapper from './LoginFormWrapper';
import { selectCurrentUser, selectAuthLoading } from './authSlice';


const Login = () => {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);

  return (user && !loading) 
    ? <Redirect to='/' />
    : <LoginFormWrapper>
        <LoginForm />
      </LoginFormWrapper>
}

export default Login;